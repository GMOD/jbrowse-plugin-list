import { getSession } from '@jbrowse/core/util';
export function orthologLaunchView({ newViewTitle, view, feature, orthologParams, }) {
    getSession(view).addView('MsaView', {
        type: 'MsaView',
        displayName: newViewTitle,
        connectedViewId: view.id,
        connectedFeature: feature.toJSON(),
        drawNodeBubbles: true,
        colWidth: 10,
        rowHeight: 12,
        orthologParams,
    });
}
