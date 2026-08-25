import type { PairwiseAlignment } from '../mappings';
import type { AlignmentAlgorithm } from './types';
interface AlignmentResult {
    alignedSeq1: string;
    alignedSeq2: string;
    score: number;
}
/**
 * Ceiling on the dynamic-programming table, in cells. Both algorithms are
 * O(m*n) time and hold one byte of traceback per cell, so this bounds the
 * alignment at ~40 MB and roughly a second of main-thread work. Without it a
 * titin-sized transcript or a long nucleic-acid chain locks up or OOMs the tab.
 * Callers that have several candidates to align should check `alignmentTooLarge`
 * and skip the oversized ones rather than let this throw.
 */
export declare const MAX_ALIGNMENT_CELLS = 40000000;
export declare function alignmentTooLarge(len1: number, len2: number): boolean;
/**
 * Needleman-Wunsch global alignment algorithm
 * Aligns entire sequences end-to-end
 */
export declare function needlemanWunsch(seq1: string, seq2: string, gapOpen?: number, gapExtend?: number): AlignmentResult;
/**
 * Smith-Waterman local alignment algorithm
 * Finds the best local alignment between subsequences
 */
export declare function smithWaterman(seq1: string, seq2: string, gapOpen?: number, gapExtend?: number): AlignmentResult;
export declare function runLocalAlignment(seq1: string, seq2: string, algorithm: AlignmentAlgorithm): PairwiseAlignment;
export {};
