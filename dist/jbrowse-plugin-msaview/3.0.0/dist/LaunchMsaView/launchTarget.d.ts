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
export declare function isGeneLikeType(type: unknown): boolean;
/**
 * How to get the right-clicked feature, or nothing when there is no gene to
 * launch on. Both host shapes reduce to a thunk, so the menu item is built and
 * the dialog is opened by one code path — and the same gene test decides both.
 * The strict three-name set the legacy branch used to carry disagreed with the
 * loose one above, so a `lnc_RNA` offered the menu item on a 4.3 host and not
 * on a 3.7 one.
 */
export declare function launchTarget(self: DisplayModel): (() => Promise<Feature | undefined>) | undefined;
