import Plugin from '@jbrowse/core/Plugin';
import { isAbstractMenuManager, isElectron } from '@jbrowse/core/util';
import { getRoot, getSnapshot } from '@jbrowse/mobx-state-tree';
import { saveAs, toDesktopSnapshot } from './util';
import { version } from '../package.json';
// Serializes the current web session as a desktop `.jbrowse` file. genomes
// sessions are config-shaped already, so this just folds the live session into
// a defaultSession and downloads it; desktop opens it via File > Open session.
function downloadDesktopSession(session) {
    const { jbrowse } = getRoot(session);
    const snap = toDesktopSnapshot(getSnapshot(jbrowse), getSnapshot(session));
    saveAs(new Blob([JSON.stringify(snap, null, 2)], { type: 'application/json' }), 'session.jbrowse');
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
// Candidate urls for an assembly name, most preferred first. The probe below
// takes the first that exists, so a name with no hosted config anywhere is
// still answered by staying quiet.
//
// A UCSC db gets `minimal.json` ahead of `config.json`. Both carry the same
// `assemblies` block (minimal.json is a filtered copy of config.json, tracks
// dropped to NCBI RefSeq / GENCODE / RepeatMasker / gaps), and the assembly is
// the whole reason this connection exists — the tracks are a bonus for the
// panel it opens. The full config is an expensive way to learn a sequence
// adapter: hg38 is 2.1MB against minimal's 300KB, hg19 1.35MB against 57KB,
// hs1 603KB against 12KB, and the parse is followed by MST instantiating every
// track config in it on the main thread (hg38 595 against 33, hs1 624 against
// 7). hg38 alone names 239 distinct mate assemblies across its 239 synteny
// tracks, so a session that opens a few of them pays this several times over.
//
// What minimal.json costs is the mate genome's long tail — conservation,
// expression, the rest of the hub. Those are still one "Add connection" away
// on the full config url, and nothing about this panel implied they were
// coming. GenArk hubs have no minimal.json and don't need one; their whole
// config is ~40KB.
function getConfigUrls(assemblyName) {
    if (assemblyName.startsWith('GCA_') || assemblyName.startsWith('GCF_')) {
        const url = getGenArkConfigUrl(assemblyName);
        return url ? [url] : [];
    }
    const base = `https://jbrowse.org/ucsc/${assemblyName}`;
    return [`${base}/minimal.json`, `${base}/config.json`];
}
// Every assembly name this plugin has already taken a run at, whether the probe
// is still in flight or came back with nothing. The extension point fires on an
// unresolved read, and `get` is read from render paths, so a name that resolves
// to no hosted config is asked about again and again — GenArk strain hubs
// (mouseStrains and friends) live under /hubs/genark/<hub>/<strain>/ and are not
// at the url guessed from the name, and a session can name an assembly this host
// has never heard of at all. Clearing this once the probe settled (what an
// earlier `finally` did) meant the next read re-probed, i.e. one HEAD per render
// forever for exactly the names nothing can supply.
//
// A name that DID resolve is also in here, and is separately deduped by
// connectionId once the connection exists. Nothing is ever removed within a
// session: a probe answers a question about a url that does not change within a
// page load.
//
// Keyed by session, because the connection a probe created belongs to the
// session and goes with it. A flat Set would remember a name across
// `setSession` and leave the new session unable to resolve a genome the old one
// had. WeakMap so a replaced session is still collectable.
//
// jbrowse-core@main reports each unknown name to the extension point once per
// session, which makes this redundant there — but this plugin runs against
// whatever core the host page shipped, down to the v4.0.0 floor, where it is
// the only thing standing between a mistyped assembly name and an unbounded
// request stream.
const attempted = new WeakMap();
function markAttempted(session, assemblyName) {
    let names = attempted.get(session);
    if (!names) {
        names = new Set();
        attempted.set(session, names);
    }
    if (names.has(assemblyName)) {
        return false;
    }
    names.add(assemblyName);
    return true;
}
// Connect to the first of `uris` that exists. Connecting to a config that 404s
// puts a red error snackbar over a session that is otherwise working, so probe
// first and stay quiet when there's nothing there — some other handler, or the
// session itself, may be supplying the assembly.
async function connectIfConfigExists(session, assemblyName, uris) {
    const connectionId = `jb2hub-${assemblyName}`;
    if (session.connections.find(f => f.connectionId === connectionId) ||
        !markAttempted(session, assemblyName)) {
        return;
    }
    for (const uri of uris) {
        const response = await fetch(uri, { method: 'HEAD' });
        if (response.ok) {
            const conf = {
                type: 'JB2TrackHubConnection',
                uri,
                name: `conn_${assemblyName}`,
                assemblyNames: [assemblyName],
                connectionId,
            };
            session.addConnectionConf(conf);
            // `silent`: no "Successfully loaded" snackbar. Nobody asked for this
            // connection — it exists because a track referenced an assembly the
            // session didn't have — so announcing it is noise over whatever the
            // user was doing, and it lands on top of any screenshot of a hub
            // genome. The property is newer than every released core (it landed
            // after v4.3.0) and this plugin runs against whatever core the host
            // page shipped, down to the v4.0.0 floor, but passing it is safe
            // regardless: MST drops an undeclared key off a model snapshot rather
            // than rejecting it (verified against the fork — the instance is
            // created, the key is neither readable on it nor in its snapshot), so
            // an older core makes the same connection it always did and keeps its
            // toast.
            session.makeConnection(conf, { silent: true });
            return;
        }
    }
}
export default class HubsViewerPlugin extends Plugin {
    name = 'HubsViewerPlugin';
    version = version;
    install(pluginManager) {
        pluginManager.addToExtensionPoint('Core-handleUnrecognizedAssembly', (defaultResult, args) => {
            const session = args.session;
            const assemblyName = args.assemblyName;
            const uris = assemblyName ? getConfigUrls(assemblyName) : [];
            if (session && assemblyName && uris.length > 0) {
                // the extension point is sync; the probe and the connection it may
                // create land later, which is fine because assemblyManager re-reads
                // reactively once the assembly shows up
                connectIfConfigExists(session, assemblyName, uris).catch((e) => {
                    console.error(e);
                });
            }
            // Pass the accumulator through: this extension point chains handlers, so
            // returning undefined would clobber another plugin's result.
            return defaultResult;
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