export default function LaunchMsaViewExtensionPointF(pluginManager) {
    pluginManager.addToExtensionPoint('LaunchView-MsaView', 
    // @ts-expect-error
    ({ session, data, msaFileLocation, msaIndexedLocation, msaName, treeFileLocation, connectedViewId, connectedFeature, displayName, colorSchemeName, colWidth, rowHeight, treeAreaWidth, treeWidth, drawNodeBubbles, labelsAlignRight, showBranchLen, querySeqName, highlightColumns, }) => {
        if (!data && !msaFileLocation && !msaIndexedLocation) {
            throw new Error('No MSA data or file location provided when launching MSA view');
        }
        session.addView('MsaView', {
            type: 'MsaView',
            displayName,
            connectedViewId,
            connectedFeature,
            colorSchemeName,
            colWidth,
            rowHeight,
            treeAreaWidth,
            treeWidth,
            drawNodeBubbles,
            labelsAlignRight,
            showBranchLen,
            highlightColumns,
            init: {
                msaData: data?.msa,
                treeData: data?.tree,
                msaUrl: msaFileLocation?.uri,
                msaIndexedLocation,
                msaName,
                treeUrl: treeFileLocation?.uri,
                querySeqName,
            },
        });
    });
}
