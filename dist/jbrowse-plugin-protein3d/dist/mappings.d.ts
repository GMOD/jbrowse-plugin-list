import { Feature } from '@jbrowse/core/util';
export interface AlignmentRow {
    id: string;
    seq: string;
}
export interface PairwiseAlignment {
    consensus: string;
    alns: readonly [AlignmentRow, AlignmentRow];
}
export declare function structureSeqVsTranscriptSeqMap(pairwiseAlignment: PairwiseAlignment): {
    structureSeqToTranscriptSeqPosition: Record<number, number>;
    transcriptSeqToStructureSeqPosition: Record<number, number>;
};
export declare function structurePositionToAlignmentMap(pairwiseAlignment: PairwiseAlignment): Record<number, number>;
export declare function transcriptPositionToAlignmentMap(pairwiseAlignment: PairwiseAlignment): Record<number, number>;
export declare function genomeToTranscriptSeqMapping(feature: Feature): {
    g2p: Record<number, number>;
    p2g: Record<number, number>;
    refName: string;
    strand: number;
};
