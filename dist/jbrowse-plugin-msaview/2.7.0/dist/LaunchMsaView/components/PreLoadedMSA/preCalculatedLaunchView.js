import { getSession } from '@jbrowse/core/util';
export function preCalculatedLaunchView({ newViewTitle, view, feature, data, querySeqName, }) {
    getSession(view).addView('MsaView', {
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
