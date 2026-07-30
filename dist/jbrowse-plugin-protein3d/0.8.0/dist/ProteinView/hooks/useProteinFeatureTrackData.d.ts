import type { UniProtFeature } from './useUniProtFeatures';
import type { JBrowsePluginProteinStructureModel } from '../model';
export interface FeatureLayout {
    feature: UniProtFeature;
    alignmentStart: number;
    alignmentEnd: number;
    left: number;
    width: number;
    lane: number;
}
export interface FeatureGroup {
    type: string;
    layouts: FeatureLayout[];
    laneCount: number;
}
export interface FeatureTrackData {
    visibleGroups: FeatureGroup[];
    sequenceLength: number;
}
/**
 * UniProt feature coords are 1-based inclusive; the structure/click/highlight
 * pipeline works in 0-based half-open ranges. Doing the conversion in one named
 * place keeps the off-by-one out of every call site.
 */
export declare function oneBasedUniProtFeatureToStructureRange(feature: {
    start: number;
    end: number;
}): {
    start: number;
    end: number;
};
/**
 * Greedy interval packing: assigns each feature the first lane whose last
 * feature ends before this one starts, so overlapping features of the same type
 * stack instead of hiding each other. Mutates each layout's lane and returns the
 * lane count (at least 1).
 */
export declare function packLanes(layouts: FeatureLayout[]): number;
export default function useProteinFeatureTrackData(model: JBrowsePluginProteinStructureModel, uniprotId: string | undefined): {
    data: FeatureTrackData | undefined;
    isLoading: boolean;
    error: unknown;
};
