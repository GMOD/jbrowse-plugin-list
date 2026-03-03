export function launchView({ session, newViewTitle, view, feature, msaFilehandle, treeFilehandle, querySeqName, data, }) {
    session.addView('MsaView', {
        type: 'MsaView',
        displayName: newViewTitle,
        connectedViewId: view.id,
        connectedFeature: feature.toJSON(),
        msaFilehandle,
        treeFilehandle,
        querySeqName,
        data,
    });
}
//# sourceMappingURL=launchView.js.map