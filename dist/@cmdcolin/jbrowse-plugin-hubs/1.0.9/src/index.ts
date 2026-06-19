import Plugin from '@jbrowse/core/Plugin'
import { isAbstractMenuManager, isElectron } from '@jbrowse/core/util'
import { getRoot, getSnapshot } from '@jbrowse/mobx-state-tree'

import { toDesktopSnapshot } from './util'
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
  const anchor = document.createElement('a')
  anchor.href = URL.createObjectURL(
    new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' }),
  )
  anchor.download = 'session.jbrowse'
  anchor.click()
  URL.revokeObjectURL(anchor.href)
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

export default class HubsViewerPlugin extends Plugin {
  name = 'HubsViewerPlugin'
  version = version

  install(pluginManager: PluginManager) {
    pluginManager.addToExtensionPoint(
      'Core-handleUnrecognizedAssembly',
      (_defaultResult, args) => {
        const session = args.session as Session | undefined
        const assemblyName = args.assemblyName as string | undefined
        if (!session || !assemblyName) {
          return
        }
        const uri = getConfigUrl(assemblyName)
        if (!uri) {
          return
        }
        const connectionId = `jb2hub-${assemblyName}`
        if (!session.connections.find(f => f.connectionId === connectionId)) {
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
      },
    )
  }

  configure(pluginManager: PluginManager) {
    // jbrowse-web only. In desktop you'd just save the session, and an exported
    // .jbrowse file carries this plugin in its plugins list, so an older desktop
    // would otherwise load and run this menu code when opening that file.
    if (!isElectron && isAbstractMenuManager(pluginManager.rootModel)) {
      pluginManager.rootModel.appendToMenu('File', {
        label: 'Download desktop session (.jbrowse)',
        onClick: (session: AbstractSessionModel) => {
          downloadDesktopSession(session)
        },
      })
    }
  }
}
