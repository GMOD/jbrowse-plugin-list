import { getSession } from '@jbrowse/core/util';
import { launchMsaView } from '../../../utils/launchMsaView';
import { readLaunchPlacement } from '../../../utils/workspaces';
export function preCalculatedLaunchView({ newViewTitle, view, feature, data, querySeqName, }) {
    launchMsaView(getSession(view), {
        placement: readLaunchPlacement(),
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
