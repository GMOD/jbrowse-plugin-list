import Plugin from '@jbrowse/core/Plugin'
import { isAbstractMenuManager, isElectron } from '@jbrowse/core/util'
import { getRoot, getSnapshot } from '@jbrowse/mobx-state-tree'

import { saveAs, toDesktopSnapshot } from './util'
import { version } from '../package.json'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { AbstractSessionModel } from '@jbrowse/core/util'
import type { IAnyStateTreeNode } from '@jbrowse/mobx-state-tree'

interface Session {
  makeConnection: (conf: unknown) => void
  addConnectionConf: (conf: unknown) => void
  connections: { connectionId: string }[]
}

// Serializes the current web session as a desktop `.jbrowse` file. genomes
// sessions are config-shaped already, so this just folds the live session into
// a defaultSession and downloads it; desktop opens it via File > Open session.
function downloadDesktopSession(session: AbstractSessionModel) {
  const { jbrowse } = getRoot<{ jbrowse: IAnyStateTreeNode }>(session)
  const snap = toDesktopSnapshot(
    getSnapshot<Record<string, unknown>>(jbrowse),
    getSnapshot<Record<string, unknown>>(session),
  )
  saveAs(
    new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' }),
    'session.jbrowse',
  )
}

function getGenArkConfigUrl(accession: string) {
  const [base, rest] = accession.split('_')
  if (!rest) {
    return undefined
  }
  const match = rest.match(/.{1,3}/g)
  if (!match || match.length < 3) {
    return undefined
  }
  const [b1, b2, b3] = match
  return `https://jbrowse.org/hubs/genark/${base}/${b1}/${b2}/${b3}/${accession}/config.json`
}

function getConfigUrl(assemblyName: string) {
  if (assemblyName.startsWith('GCA_') || assemblyName.startsWith('GCF_')) {
    return getGenArkConfigUrl(assemblyName)
  }
  return `https://jbrowse.org/ucsc/${assemblyName}/config.json`
}

// Names already being resolved, so the extension point firing repeatedly for
// the same assembly (it fires on every unresolved read) starts one probe, not
// one per read. The connection itself is deduped by connectionId, but that
// check only happens once the probe has come back.
const pending = new Set<string>()

// The url is a guess from the name, and plenty of assemblies aren't at it:
// GenArk strain hubs (mouseStrains and friends) live under
// /hubs/genark/<hub>/<strain>/, and a session can name an assembly this host
// has never heard of. Connecting to a config that 404s puts a red error
// snackbar over a session that is otherwise working, so probe first and stay
// quiet when there's nothing there — some other handler, or the session
// itself, may be supplying the assembly.
async function connectIfConfigExists(
  session: Session,
  assemblyName: string,
  uri: string,
) {
  const connectionId = `jb2hub-${assemblyName}`
  if (
    !pending.has(assemblyName) &&
    !session.connections.find(f => f.connectionId === connectionId)
  ) {
    pending.add(assemblyName)
    try {
      const response = await fetch(uri, { method: 'HEAD' })
      if (response.ok) {
        const conf = {
          type: 'JB2TrackHubConnection',
          uri,
          name: `conn_${assemblyName}`,
          assemblyNames: [assemblyName],
          connectionId,
        }
        session.addConnectionConf(conf)
        session.makeConnection(conf)
      }
    } finally {
      pending.delete(assemblyName)
    }
  }
}

export default class HubsViewerPlugin extends Plugin {
  name = 'HubsViewerPlugin'
  version = version

  install(pluginManager: PluginManager) {
    pluginManager.addToExtensionPoint(
      'Core-handleUnrecognizedAssembly',
      (defaultResult, args) => {
        const session = args.session as Session | undefined
        const assemblyName = args.assemblyName as string | undefined
        const uri = session && assemblyName && getConfigUrl(assemblyName)
        if (session && assemblyName && uri) {
          // the extension point is sync; the probe and the connection it may
          // create land later, which is fine because assemblyManager re-reads
          // reactively once the assembly shows up
          connectIfConfigExists(session, assemblyName, uri).catch(
            (e: unknown) => {
              console.error(e)
            },
          )
        }
        // Pass the accumulator through: this extension point chains handlers, so
        // returning undefined would clobber another plugin's result.
        return defaultResult
      },
    )
  }

  configure(pluginManager: PluginManager) {
    // jbrowse-web only. In desktop you'd just save the session, and an exported
    // .jbrowse file carries this plugin in its plugins list, so an older desktop
    // would otherwise load and run this menu code when opening that file.
    if (!isElectron && isAbstractMenuManager(pluginManager.rootModel)) {
      // 'Tools', not 'File'. Every released core from v4.0.0 to latest defines
      // the File menu as a thunk and appends with `menu.menuItems.push()`, which
      // throws on a function; the throw escapes configure() and renders the app
      // as an error page rather than costing just this menu item. Because the
      // plugin store serves `latest/` no-cache, that took out every
      // jbrowse.org/ucsc launch on hg38/hg19/mm39/hs1 the moment 1.0.9 shipped.
      // core@main resolves item contributions lazily and accepts either form,
      // but this plugin has to keep working on the releases already in the wild.
      //
      // Belt and braces on the same reasoning: a cosmetic menu item should never
      // be able to cost a user their whole session.
      try {
        pluginManager.rootModel.appendToMenu('Tools', {
          label: 'Download desktop session (.jbrowse)',
          onClick: (session: AbstractSessionModel) => {
            downloadDesktopSession(session)
          },
        })
      } catch (e) {
        console.error('could not add the desktop-session download item', e)
      }
    }
  }
}
