import { getSession } from '@jbrowse/core/util';
import { launchMsaView } from '../../../utils/launchMsaView';
import { readLaunchPlacement } from '../../../utils/workspaces';
export function launchView({ newViewTitle, view, feature, msaFilehandle, treeFilehandle, querySeqName, data, }) {
    launchMsaView(getSession(view), {
        placement: readLaunchPlacement(),
        displayName: newViewTitle,
        connectedViewId: view.id,
        connectedFeature: feature.toJSON(),
        msaFilehandle,
        treeFilehandle,
        querySeqName,
        data,
    });
}
