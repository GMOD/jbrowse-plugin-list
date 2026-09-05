import { launchMsaView } from '../utils/launchMsaView';
export default function LaunchMsaViewExtensionPointF(pluginManager) {
    pluginManager.addToExtensionPoint('LaunchView-MsaView', (args) => {
        const { session, data, msaFileLocation, msaIndexedLocation, msaName, treeFileLocation, querySeqName, ...rest } = args;
        // `orthologParams` is a fourth source, and unlike the other three it names
        // no alignment at all — the view builds one from NCBI at launch, which is
        // the dialog's Orthologs tab reached declaratively.
        if (!data &&
            !msaFileLocation &&
            !msaIndexedLocation &&
            !rest.orthologParams) {
            throw new Error('No MSA data, file location or orthologParams provided when launching MSA view');
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
            ...rest,
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
