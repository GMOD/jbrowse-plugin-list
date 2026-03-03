import type { JBrowsePluginProteinStructureModel } from './model';
/**
 * Maps a protein structure position to genome coordinates
 * @returns [start, end] tuple of genome coordinates, or undefined if mapping fails
 */
export declare function proteinToGenomeMapping({ model, structureSeqPos, }: {
    structureSeqPos: number;
    model: JBrowsePluginProteinStructureModel;
}): readonly [number, number] | undefined;
/**
 * Maps a protein structure range to genome coordinates
 * @returns [start, end] tuple of genome coordinates spanning the full range, or undefined if mapping fails
 */
export declare function proteinRangeToGenomeMapping({ model, structureSeqPos, structureSeqEndPos, }: {
    structureSeqPos: number;
    structureSeqEndPos: number;
    model: JBrowsePluginProteinStructureModel;
}): readonly [number, number] | undefined;
export declare function clickProteinToGenome({ model, structureSeqPos, structureSeqEndPos, }: {
    structureSeqPos: number;
    structureSeqEndPos?: number;
    model: JBrowsePluginProteinStructureModel;
}): Promise<undefined>;
export declare function hoverProteinToGenome({ model, structureSeqPos, }: {
    structureSeqPos?: number;
    model: JBrowsePluginProteinStructureModel;
}): void;
