import type { PairwiseAlignment } from '../mappings';
import type { IAnyStateTreeNode } from '@jbrowse/mobx-state-tree';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
interface GenomeToTranscriptSeqMapping {
    p2g: Record<number, number>;
    strand: number;
    refName: string;
}
/**
 * Minimal model shape needed to map structure positions to genome coords.
 */
interface ProteinGenomeMappingModel {
    genomeToTranscriptSeqMapping: GenomeToTranscriptSeqMapping | undefined;
    pairwiseAlignment: PairwiseAlignment | undefined;
    structureSeqToTranscriptSeqPosition: Record<number, number> | undefined;
}
type NavigateToProteinPositionModel = IAnyStateTreeNode & ProteinGenomeMappingModel & {
    connectedView: LinearGenomeViewModel | undefined;
};
type ClickProteinToGenomeModel = NavigateToProteinPositionModel & {
    zoomToBaseLevel: boolean;
    setClickedStructureRange: (range?: {
        start: number;
        end: number;
    }) => void;
};
/**
 * Maps a protein structure position to genome coordinates
 * @returns [start, end] tuple of genome coordinates, or undefined if mapping fails
 */
export declare function proteinToGenomeMapping({ model, structureSeqPos, }: {
    structureSeqPos: number;
    model: ProteinGenomeMappingModel;
}): readonly [number, number] | undefined;
/**
 * Maps a protein structure range to genome coordinates
 * @returns [start, end] tuple of genome coordinates spanning the full range, or undefined if mapping fails
 */
export declare function proteinRangeToGenomeMapping({ model, structureSeqPos, structureSeqEndPos, }: {
    structureSeqPos: number;
    structureSeqEndPos: number;
    model: ProteinGenomeMappingModel;
}): readonly [number, number] | undefined;
export declare function navigateToProteinPosition({ model, structureSeqPos, structureSeqEndPos, zoomToBaseLevel, }: {
    structureSeqPos: number;
    structureSeqEndPos?: number;
    model: NavigateToProteinPositionModel;
    zoomToBaseLevel: boolean;
}): Promise<void>;
export declare function clickProteinToGenome({ model, structureSeqPos, structureSeqEndPos, }: {
    structureSeqPos: number;
    structureSeqEndPos?: number;
    model: ClickProteinToGenomeModel;
}): Promise<void>;
export {};
