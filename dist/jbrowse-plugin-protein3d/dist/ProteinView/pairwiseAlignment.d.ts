import type { PairwiseAlignment } from '../mappings';
import type { AlignmentAlgorithm } from './types';
interface AlignmentResult {
    alignedSeq1: string;
    alignedSeq2: string;
    score: number;
}
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
