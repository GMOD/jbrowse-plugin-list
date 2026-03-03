export function ensemblGeneTreeLaunchView({ session, newViewTitle, view, feature, data, }) {
    session.addView('MsaView', {
        type: 'MsaView',
        displayName: newViewTitle,
        colWidth: 10,
        rowHeight: 12,
        data,
        connectedViewId: view.id,
        connectedFeature: feature.toJSON(),
    });
}
//# sourceMappingURL=ensemblGeneTreeLaunchView.js.map