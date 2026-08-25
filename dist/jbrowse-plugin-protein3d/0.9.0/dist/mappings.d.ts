import type { Feature } from '@jbrowse/core/util';
export interface AlignmentRow {
    id: string;
    seq: string;
}
/**
 * A two-row alignment whose ROW ORDER IS A CONTRACT: row 0 is the transcript,
 * row 1 is the structure. Every producer honors it — runLocalAlignment is
 * always called as (transcript, structure), and the manual-import dialog tells
 * the user to paste them in that order — and every consumer depends on it, but
 * nothing in the type can enforce it, and swapping the two silently inverts
 * every coordinate map. Read the rows through the accessors below rather than
 * indexing, so a call site states which sequence it means.
 */
export interface PairwiseAlignment {
    consensus: string;
    alns: readonly [AlignmentRow, AlignmentRow];
}
export declare const transcriptAlignedSeq: (pa: PairwiseAlignment) => string;
export declare const structureAlignedSeq: (pa: PairwiseAlignment) => string;
/** Number of columns, gaps included. Both rows have this length by definition;
 * `pairwiseAlignmentProblem` is what guarantees it. */
export declare const alignmentLength: (pa: PairwiseAlignment) => number;
/**
 * Why a pairwise alignment can't be used, or undefined if it's usable. The two
 * rows must be the same non-zero length — every coordinate map walks them in
 * lockstep, so a ragged pair would map positions to nonsense. Callers that
 * accept alignments from outside (the manual-import dialog) check this and
 * report it; the internal map builders assert on it.
 */
export declare function pairwiseAlignmentProblem(pa: PairwiseAlignment): string | undefined;
export declare function structureSeqVsTranscriptSeqMap(pairwiseAlignment: PairwiseAlignment): {
    structureSeqToTranscriptSeqPosition: Record<number, number>;
    transcriptSeqToStructureSeqPosition: Record<number, number>;
};
export declare function structurePositionToAlignmentMap(pairwiseAlignment: PairwiseAlignment): Record<number, number>;
export declare function transcriptPositionToAlignmentMap(pairwiseAlignment: PairwiseAlignment): Record<number, number>;
export declare function genomeToTranscriptSeqMapping(feature: Feature): {
    g2p: Record<number, number>;
    p2g: Record<number, number>;
    p2gCodon: Record<number, number[]>;
    refName: string;
    strand: number;
};
export declare function codonGenomeSpan(p2gCodon: Record<number, number[]>, proteinPos: number): readonly [number, number] | undefined;
