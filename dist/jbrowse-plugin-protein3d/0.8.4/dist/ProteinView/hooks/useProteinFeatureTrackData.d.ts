import type { UniProtFeature } from './useUniProtFeatures';
import type { JBrowsePluginProteinStructureModel } from '../model';
import type { MapUniProtPosition } from '../pdbUniProtMapping';
export interface FeatureLayout {
    feature: UniProtFeature;
    /** 0-based half-open structure-residue range the feature covers */
    structureStart: number;
    structureEnd: number;
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
 * Places a UniProt feature: its 1-based inclusive UniProt range becomes a
 * 0-based half-open structure range (identity for AlphaFold, SIFTS-offset for
 * PDB — see useStructureUniProt), then alignment columns and pixel geometry.
 * This is the only UniProt->structure coordinate conversion in the tracks; every
 * consumer reads `structureStart`/`structureEnd` off the layout.
 *
 * Returns undefined when either endpoint falls outside the structure or has no
 * alignment column, so an unmappable feature is dropped rather than drawn at a
 * misleading position.
 */
export declare function layoutFeature(feature: UniProtFeature, structurePositionToAlignmentMap: Record<number, number>, mapUniProtPosition: MapUniProtPosition): FeatureLayout | undefined;
/**
 * Greedy interval packing: assigns each feature the first lane whose last
 * feature ends before this one starts, so overlapping features of the same type
 * stack instead of hiding each other. Mutates each layout's lane and returns the
 * lane count (at least 1).
 */
export declare function packLanes(layouts: FeatureLayout[]): number;
export default function useProteinFeatureTrackData(model: JBrowsePluginProteinStructureModel, uniprotId: string | undefined, mapUniProtPosition: MapUniProtPosition): {
    data: FeatureTrackData | undefined;
    isLoading: boolean;
    error: unknown;
};
