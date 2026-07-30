import Plugin from '@jbrowse/core/Plugin';
import { isAbstractMenuManager, isElectron } from '@jbrowse/core/util';
import { getRoot, getSnapshot } from '@jbrowse/mobx-state-tree';
import { toDesktopSnapshot } from './util';
import { version } from '../package.json';
// Serializes the current web session as a desktop `.jbrowse` file. genomes
// sessions are config-shaped already, so this just folds the live session into
// a defaultSession and downloads it; desktop opens it via File > Open session.
function downloadDesktopSession(session) {
    const { jbrowse } = getRoot(session);
    const snap = toDesktopSnapshot(getSnapshot(jbrowse), getSnapshot(session));
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' }));
    anchor.download = 'session.jbrowse';
    anchor.click();
    URL.revokeObjectURL(anchor.href);
}
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
    configure(pluginManager) {
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
                    onClick: (session) => {
                        downloadDesktopSession(session);
                    },
                });
            }
            catch (e) {
                console.error('could not add the desktop-session download item', e);
            }
        }
    }
}
//# sourceMappingURL=index.js.map