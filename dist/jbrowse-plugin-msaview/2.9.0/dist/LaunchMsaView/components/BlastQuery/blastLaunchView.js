import { getSession } from '@jbrowse/core/util';
export function blastLaunchView({ newViewTitle, view, feature, blastParams, }) {
    getSession(view).addView('MsaView', {
        type: 'MsaView',
        displayName: newViewTitle,
        connectedViewId: view.id,
        connectedFeature: feature.toJSON(),
        drawNodeBubbles: true,
        colWidth: 10,
        rowHeight: 12,
        blastParams,
    });
}
export function blastLaunchViewFromCache({ newViewTitle, view, cached, connectedFeature, }) {
    getSession(view).addView('MsaView', {
        type: 'MsaView',
        displayName: newViewTitle,
        connectedViewId: view.id,
        connectedFeature,
        drawNodeBubbles: true,
        colWidth: 10,
        rowHeight: 12,
        data: {
            msa: cached.msa,
            tree: cached.tree,
            treeMetadata: cached.treeMetadata,
        },
    });
}
