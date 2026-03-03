export default function LaunchMsaViewExtensionPointF(pluginManager) {
    pluginManager.addToExtensionPoint('LaunchView-MsaView', 
    // @ts-expect-error
    ({ session, data, msaFileLocation, treeFileLocation, connectedViewId, connectedFeature, displayName, colorSchemeName, colWidth, rowHeight, treeAreaWidth, treeWidth, drawNodeBubbles, labelsAlignRight, showBranchLen, querySeqName, }) => {
        if (!data && !msaFileLocation) {
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
            init: {
                msaData: data?.msa,
                treeData: data?.tree,
                msaUrl: msaFileLocation?.uri,
                treeUrl: treeFileLocation?.uri,
                querySeqName,
            },
        });
    });
}
//# sourceMappingURL=index.js.map