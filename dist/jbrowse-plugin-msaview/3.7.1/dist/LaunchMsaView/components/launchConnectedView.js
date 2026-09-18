import { useState } from 'react';
import { getSession } from '@jbrowse/core/util';
import { launchMsaView } from '../../utils/launchMsaView';
/** how a view whose alignment the plugin builds opens */
export const builtAlignmentLook = {
    drawNodeBubbles: true,
    colWidth: 10,
    rowHeight: 12,
};
/**
 * Every dialog launch: an MSA view tied to the genome view it came from, and
 * through `feature` to the transcript whose codons its query row is read by.
 */
export function launchConnectedView({ view, feature, placement, ...snapshot }) {
    launchMsaView(getSession(view), {
        placement,
        connectedViewId: view.id,
        connectedFeature: feature?.toJSON(),
        ...snapshot,
    });
}
/** runs a panel's launch, closing the dialog on success and keeping the error */
export function useLaunchSubmit(handleClose) {
    const [launchError, setLaunchError] = useState();
    return {
        launchError,
        submit: (launch) => {
            try {
                setLaunchError(undefined);
                launch();
                handleClose();
            }
            catch (e) {
                console.error(e);
                setLaunchError(e);
            }
        },
    };
}
