import { expandSpec } from 'react-msaview';
import { launchMsaView } from '../utils/launchMsaView';
/**
 * `msa` and `tree` onto the plugin's own sources, so a url still goes through
 * `init.msaUrl` and its format sniffing, and `query` onto `querySeqName`
 */
function withLongSources({ msa, tree, ...args }) {
    const inlineMsa = msa?.includes('\n') ? msa : undefined;
    const inlineTree = tree?.trimStart().startsWith('(') ? tree : undefined;
    const data = inlineMsa || inlineTree
        ? {
            ...args.data,
            ...(inlineMsa ? { msa: inlineMsa } : {}),
            ...(inlineTree ? { tree: inlineTree } : {}),
        }
        : args.data;
    return {
        ...args,
        data: data,
        ...(msa && !inlineMsa ? { msaFileLocation: { uri: msa } } : {}),
        ...(tree && !inlineTree ? { treeFileLocation: { uri: tree } } : {}),
        querySeqName: args.querySeqName ?? args.query,
    };
}
export default function LaunchMsaViewExtensionPointF(pluginManager) {
    pluginManager.addToExtensionPoint('LaunchView-MsaView', (args) => {
        const { session, query, data, msaFileLocation, msaIndexedLocation, msaName, treeFileLocation, querySeqName, searchParams, ...rest } = withLongSources(args);
        // `orthologParams` and `searchParams` name no alignment at all — the
        // view builds one at launch, which is the dialog's Orthologs and BLAST
        // tabs reached declaratively.
        if (!data &&
            !msaFileLocation &&
            !msaIndexedLocation &&
            !rest.orthologParams &&
            !searchParams) {
            throw new Error('No MSA data, file location, orthologParams or searchParams provided when launching MSA view');
        }
        // inline data and the tree URL are native react-msaview snapshot props, set
        // directly, and so is orthologParams (the model's own autorun picks it up).
        // Only sources needing launch-time resolution go through `init`: msaUrl
        // (AlphaFold sniff) and the name-indexed bgzip block (no native loader).
        //
        // An init whose every field is undefined is still a truthy object, and
        // MsaViewPanel reads any init as a launch in flight, so an inline-data
        // launch flashed "Loading alignment" until processInit cleared it.
        const init = {
            msaUrl: msaFileLocation?.uri,
            msaIndexedLocation,
            msaName,
            querySeqName,
        };
        launchMsaView(session, {
            ...expandSpec({ ...rest, query }),
            ...(searchParams ? { blastParams: searchParams } : {}),
            data,
            ...(treeFileLocation
                ? {
                    treeFilehandle: {
                        ...treeFileLocation,
                        locationType: 'UriLocation',
                    },
                }
                : {}),
            ...(Object.values(init).some(v => v !== undefined) ? { init } : {}),
        });
        return args;
    });
}
