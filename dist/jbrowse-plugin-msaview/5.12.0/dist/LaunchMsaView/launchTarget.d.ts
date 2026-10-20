import type { MenuItem } from '@jbrowse/core/ui';
import type { Feature } from '@jbrowse/core/util';
export interface ContextMenuInfo {
    item: {
        featureId: string;
        type?: string;
    };
    subfeature?: {
        featureId: string;
    };
    displayedRegionIndex: number;
}
export interface DisplayModel {
    contextMenuItems: () => MenuItem[];
    contextMenuInfo?: ContextMenuInfo;
    fetchFullFeature: (featureId: string, displayedRegionIndex: number) => Promise<Feature | undefined>;
}
/**
 * What the menu item launches on. The hit test carries a type and an id, so
 * whether the feature codes for anything can only be answered after the fetch,
 * and the caller answers it there.
 */
export interface MenuTarget {
    fetchFeature: () => Promise<Feature | undefined>;
    /**
     * The isoform the click actually landed on, when the dialog opens on its
     * gene. Climbing to the gene is what puts every isoform in the picker, and it
     * threw away which one the user pointed at: the picker then opened on the
     * longest transcript.
     */
    preferredTranscriptId?: string;
}
export declare function launchTarget(self: DisplayModel): MenuTarget | undefined;
