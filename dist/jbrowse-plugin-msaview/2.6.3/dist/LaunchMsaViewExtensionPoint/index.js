export default function LaunchMsaViewExtensionPointF(pluginManager) {
    pluginManager.addToExtensionPoint('LaunchView-MsaView', (args) => {
        const { session, data, msaFileLocation, msaIndexedLocation, msaName, treeFileLocation, querySeqName, ...rest } = args;
        if (!data && !msaFileLocation && !msaIndexedLocation) {
            throw new Error('No MSA data or file location provided when launching MSA view');
        }
        // inline data and the tree URL are native react-msaview snapshot props, set
        // directly. Only sources needing launch-time resolution go through `init`:
        // msaUrl (AlphaFold sniff) and the name-indexed bgzip block (no native loader).
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
