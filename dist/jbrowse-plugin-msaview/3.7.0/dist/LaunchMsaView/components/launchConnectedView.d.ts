import type { MsaViewPlacement } from '../../utils/workspaces';
import type { Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
/** how a view whose alignment the plugin builds opens */
export declare const builtAlignmentLook: {
    drawNodeBubbles: boolean;
    colWidth: number;
    rowHeight: number;
};
/**
 * Every dialog launch: an MSA view tied to the genome view it came from, and
 * through `feature` to the transcript whose codons its query row is read by.
 */
export declare function launchConnectedView({ view, feature, placement, ...snapshot }: {
    view: LinearGenomeViewModel;
    feature?: Feature;
    placement: MsaViewPlacement;
} & Record<string, unknown>): void;
/** runs a panel's launch, closing the dialog on success and keeping the error */
export declare function useLaunchSubmit(handleClose: () => void): {
    launchError: unknown;
    submit: (launch: () => void) => void;
};
