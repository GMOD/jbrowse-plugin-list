import type { Sample } from '../types';
/**
 * Find the index of the reference sample (matching the assembly name from the region)
 * Falls back to 0 if no match is found
 */
export declare function findRefSampleIndex(samples: Sample[] | undefined, assemblyName: string | undefined): number;
/**
 * Build a mapping from display column index to genomic position.
 * Only the reference sequence determines genomic positions - gaps in the
 * reference map to undefined (no genomic position), while gaps in other
 * samples don't affect the mapping.
 */
export declare function buildColToGenomePos(refSequence: string, regionStart: number): (number | undefined)[];
