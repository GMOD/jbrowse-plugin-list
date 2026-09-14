import { getSession } from '@jbrowse/core/util';
import { launchMsaView } from '../../../utils/launchMsaView';
import { readLaunchPlacement } from '../../../utils/workspaces';
export function orthologLaunchView({ newViewTitle, view, feature, orthologParams, }) {
    launchMsaView(getSession(view), {
        placement: readLaunchPlacement(),
        displayName: newViewTitle,
        connectedViewId: view.id,
        connectedFeature: feature.toJSON(),
        drawNodeBubbles: true,
        colWidth: 10,
        rowHeight: 12,
        orthologParams,
    });
}
