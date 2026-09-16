import { getSession } from '@jbrowse/core/util';
import { launchMsaView } from '../../../utils/launchMsaView';
import { readLaunchPlacement } from '../../../utils/workspaces';
export function blastLaunchView({ newViewTitle, view, feature, blastParams, }) {
    launchMsaView(getSession(view), {
        placement: readLaunchPlacement(),
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
    launchMsaView(getSession(view), {
        placement: readLaunchPlacement(),
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
