import { isGeneLikeType } from './codingFeature';
import type { MenuItem } from '@jbrowse/core/ui';
import type { Feature } from '@jbrowse/core/util';
export interface ContextMenuInfo {
    item: {
        featureId: string;
        type?: string;
    };
    displayedRegionIndex: number;
}
export interface DisplayModel {
    contextMenuItems: () => MenuItem[];
    contextMenuInfo?: ContextMenuInfo;
    fetchFullFeature?: (featureId: string, displayedRegionIndex: number) => Promise<Feature | undefined>;
    contextMenuFeature?: Feature;
}
/**
 * What the menu item launches on. A legacy host hands over the whole feature,
 * so whether it codes for anything is known while the menu is built; a canvas
 * host's hit test carries a type and an id, so that question can only be
 * answered after the fetch, and the caller answers it there.
 */
interface ClickedTranscript {
    /**
     * The isoform the click actually landed on, when the dialog opens on its
     * gene. Climbing to the gene is what puts every isoform in the picker, and it
     * threw away which one the user pointed at: the picker then opened on the
     * longest transcript, and on a v4 host that is the only place the choice was
     * ever stated.
     */
    preferredTranscriptId?: string;
}
export type MenuTarget = (ClickedTranscript & {
    feature: Feature;
}) | (ClickedTranscript & {
    fetchFeature: () => Promise<Feature | undefined>;
});
export { isGeneLikeType };
/**
 * How to get the right-clicked feature, or nothing when there is nothing to
 * launch on. Both host shapes reduce to one target, so the menu item is built
 * and the dialog is opened by one code path — and the same gene test decides
 * both. The strict three-name set the legacy branch used to carry disagreed
 * with the loose one above, so a `lnc_RNA` offered the menu item on a 4.3 host
 * and not on a 3.7 one.
 *
 * Gene-like is not enough on its own: an lncRNA has no protein to align, and
 * accepting it opened a dialog whose Submit never left grey, with nothing
 * saying why. Where the whole feature is in hand the CDS decides here -- but
 * only where there are subfeatures to read it off, since a feature that came
 * with none has not answered the question.
 */
export declare function launchTarget(self: DisplayModel): MenuTarget | undefined;
