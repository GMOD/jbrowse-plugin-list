import { getSession } from '@jbrowse/core/util';
export function launchView({ newViewTitle, view, feature, msaFilehandle, treeFilehandle, querySeqName, data, }) {
    getSession(view).addView('MsaView', {
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
