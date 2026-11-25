import Plugin from '@jbrowse/core/Plugin';
import { isAbstractMenuManager, isElectron, isSessionModelWithConnections, saveAs, } from '@jbrowse/core/util';
import { getRoot, getSnapshot, isStateTreeNode } from '@jbrowse/mobx-state-tree';
import { describeAssemblies } from './describeAssemblies';
import { findHostedAssembly } from './hostedAssembly';
import { toDesktopSnapshot } from './util';
import { version } from '../package.json';
function isHubSession(session) {
    return (isSessionModelWithConnections(session) && 'addConnectionConf' in session);
}
// jbrowse-web's config node, on hosts before v5.0.0-beta.21, strips each
// `baseUri` from its own snapshot, which leaves each relative `uri` bare, and
// desktop resolves a bare one against the directory the .jbrowse file sits
// in. Its children's snapshots keep them
function configSnapshot(jbrowse) {
    const node = jbrowse;
    return Object.fromEntries(Object.keys(getSnapshot(jbrowse)).map(key => {
        const value = node[key];
        return [key, isStateTreeNode(value) ? getSnapshot(value) : value];
    }));
}
function downloadDesktopSession(session) {
    const { jbrowse } = getRoot(session);
    const snap = toDesktopSnapshot(configSnapshot(jbrowse), getSnapshot(session));
    saveAs(new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' }), 'session.jbrowse');
}
// `silent` because nobody asked for this connection, so its "Successfully
// loaded" snackbar would be noise over whatever the user was doing
async function connectHostedAssembly(session, assemblyName) {
    if (isHubSession(session)) {
        const connectionId = `jb2hub-${assemblyName}`;
        // A reloaded or shared session keeps the connection's config and not its
        // instance
        const stored = session.connections.find(conf => conf.connectionId === connectionId);
        if (stored) {
            session.makeConnection(stored, { silent: true });
        }
        else {
            const hosted = await findHostedAssembly(assemblyName);
            if (hosted) {
                const conf = {
                    type: 'JB2TrackHubConnection',
                    uri: hosted.configUrl,
                    name: `conn_${assemblyName}`,
                    assemblyNames: [assemblyName],
                    connectionId,
                };
                session.addConnectionConf(conf);
                session.makeConnection(conf, { silent: true });
            }
        }
    }
}
export default class HubsViewerPlugin extends Plugin {
    name = 'HubsViewerPlugin';
    version = version;
    install(pluginManager) {
        // The promise is what lets core's waitForAssembly end when the lookup
        // does, instead of on a timeout
        pluginManager.listenToExtensionPoint('Core-handleUnrecognizedAssembly', ({ session, assemblyName }) => connectHostedAssembly(session, assemblyName).catch((e) => {
            console.error(e);
        }));
        pluginManager.addToExtensionPoint('Core-describeAssemblies', (described, { assemblyNames }) => describeAssemblies(described, assemblyNames));
    }
    configure(pluginManager) {
        // In desktop you'd just save the session
        if (!isElectron && isAbstractMenuManager(pluginManager.rootModel)) {
            pluginManager.rootModel.appendToMenu('Tools', {
                label: 'Download desktop session (.jbrowse)',
                onClick: (session) => {
                    downloadDesktopSession(session);
                },
            });
        }
    }
}
//# sourceMappingURL=index.js.map