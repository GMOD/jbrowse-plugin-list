export function preCalculatedLaunchView({ session, newViewTitle, view, feature, data, querySeqName, }) {
    session.addView('MsaView', {
        type: 'MsaView',
        displayName: newViewTitle,
        treeAreaWidth: 200,
        querySeqName,
        treeWidth: 100,
        drawNodeBubbles: false,
        labelsAlignRight: true,
        showBranchLen: false,
        colWidth: 10,
        rowHeight: 12,
        colorSchemeName: 'percent_identity_dynamic',
        data,
        connectedViewId: view.id,
        connectedFeature: feature.toJSON(),
    });
}
//# sourceMappingURL=preCalculatedLaunchView.js.map