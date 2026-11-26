import type { ArrayBlock } from './alleles';
import type { ReadLayout } from './readLayout';
/**
 * Each read's group within its sample by row name, `A` the first. A sample
 * whose reads agree has no groups, and a read spanning none of its sample's
 * sites is in none.
 */
export declare function clusterReads(reads: ReadLayout[], arrays: ArrayBlock[], window: {
    start: number;
    end: number;
}, referenceName?: string): Map<string, string>;
