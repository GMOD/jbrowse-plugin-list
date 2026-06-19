import Plugin from '@jbrowse/core/Plugin';
import { version } from '../package.json';
function getGenArkConfigUrl(accession) {
    const [base, rest] = accession.split('_');
    if (!rest) {
        return undefined;
    }
    const match = rest.match(/.{1,3}/g);
    if (!match || match.length < 3) {
        return undefined;
    }
    const [b1, b2, b3] = match;
    return `https://jbrowse.org/hubs/genark/${base}/${b1}/${b2}/${b3}/${accession}/config.json`;
}
function getConfigUrl(assemblyName) {
    if (assemblyName.startsWith('GCA_') || assemblyName.startsWith('GCF_')) {
        return getGenArkConfigUrl(assemblyName);
    }
    return `https://jbrowse.org/ucsc/${assemblyName}/config.json`;
}
export default class HubsViewerPlugin extends Plugin {
    name = 'HubsViewerPlugin';
    version = version;
    install(pluginManager) {
        pluginManager.addToExtensionPoint('Core-handleUnrecognizedAssembly', (_defaultResult, args) => {
            const session = args.session;
            const assemblyName = args.assemblyName;
            if (!session || !assemblyName) {
                return;
            }
            const uri = getConfigUrl(assemblyName);
            if (!uri) {
                return;
            }
            const connectionId = `jb2hub-${assemblyName}`;
            if (!session.connections.find(f => f.connectionId === connectionId)) {
                const conf = {
                    type: 'JB2TrackHubConnection',
                    uri,
                    name: `conn_${assemblyName}`,
                    assemblyNames: [assemblyName],
                    connectionId,
                };
                session.addConnectionConf(conf);
                session.makeConnection(conf);
            }
        });
    }
    configure(_pluginManager) { }
}
//# sourceMappingURL=index.js.map