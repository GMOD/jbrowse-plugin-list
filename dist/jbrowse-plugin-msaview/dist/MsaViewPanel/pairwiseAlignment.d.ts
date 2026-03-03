interface AlignmentResult {
    alignedSeq1: string;
    alignedSeq2: string;
    score: number;
}
export interface AlignmentRow {
    id: string;
    seq: string;
}
export interface PairwiseAlignment {
    consensus: string;
    alns: readonly [AlignmentRow, AlignmentRow];
}
/**
 * Needleman-Wunsch global alignment algorithm
 */
export declare function needlemanWunsch(seq1: string, seq2: string, gapOpen?: number, gapExtend?: number): AlignmentResult;
export declare function runPairwiseAlignment(seq1: string, seq2: string): PairwiseAlignment;
/**
 * Build coordinate mappings from a pairwise alignment
 * Maps between ungapped positions in seq1 and seq2
 */
export declare function buildAlignmentMaps(pairwiseAlignment: PairwiseAlignment): {
    seq1ToSeq2: Map<number, number>;
    seq2ToSeq1: Map<number, number>;
};
export {};
