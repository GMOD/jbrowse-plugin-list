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
        session.addView('MsaView', {
            type: 'MsaView',
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
            init: {
                msaUrl: msaFileLocation?.uri,
                msaIndexedLocation,
                msaName,
                querySeqName,
            },
        });
        return args;
    });
}
