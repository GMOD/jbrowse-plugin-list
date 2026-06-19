import Plugin from '@jbrowse/core/Plugin'
import PluginManager from '@jbrowse/core/PluginManager'

import { version } from '../package.json'

interface Session {
  makeConnection: (conf: unknown) => void
  addConnectionConf: (conf: unknown) => void
  connections: { connectionId: string }[]
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

  configure(_pluginManager: PluginManager) {}
}
