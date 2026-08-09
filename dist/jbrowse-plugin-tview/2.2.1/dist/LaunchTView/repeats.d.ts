/**
 * Finding tandem arrays in the *reference*, rather than in what the reads
 * inserted.
 *
 * The insertion-anchored reading — "an array is the sequence some read inserted
 * at one reference position" — is what the aligner happens to produce, not what
 * is there. Measured against the GIAB trio at HTT, ATXN3 and TCF4 it fails in
 * three ways at once:
 *
 * - **The array is already in the reference.** A read's insertion is only its
 *   allele's *excess* over the reference copy count, so `n=5` at HTT means five
 *   copies more than hg19's, not a five-copy allele. A contracted allele inserts
 *   nothing at all and vanishes from the site.
 * - **One array reports as several sites.** An indel inside an array has no
 *   unique placement, so the aligner anchors different reads at different
 *   positions: ATXN3 in HG002 came back as four separate arrays at 92537353,
 *   ...354, ...358 and ...372, splitting one locus's alleles across four counts.
 * - **A read that spans the array without an insertion is invisible**, so the
 *   reference-length allele — usually the commonest one — is never counted.
 *
 * Anchoring on a reference interval fixes all three: the interval is the same
 * for every read, so an allele is "what this read has between here and here",
 * however the aligner chose to write it, and the reference is just another
 * allele.
 */
export declare const MIN_PERIOD = 2;
export declare const MAX_PERIOD = 300;
export declare const MIN_COPIES = 3;
export interface ReferenceArray {
    /** reference position the array starts at, inclusive */
    start: number;
    /** reference position the array ends at, exclusive */
    end: number;
    /** repeat unit length in bp */
    period: number;
    /** the reference's own first copy, used as the alignment consensus */
    unit: string;
}
/**
 * Tandem arrays in `seq`, which is the reference over the viewed region
 * starting at `offset`.
 *
 * Scanning periods upward and refusing to start an array inside one already
 * found is what reports a 3bp array as 3bp rather than as 6bp or 9bp: every
 * multiple of a real period scores just as well, and the smallest one is the
 * unit. It also means a long array with a short unit hides a spurious long-unit
 * one inside it, which is the failure mode of scanning periods independently.
 */
export declare function findReferenceArrays(seq: string, offset?: number): ReferenceArray[];
/**
 * Merge arrays that touch or overlap into one interval, named by the shortest
 * period that describes most of it.
 *
 * An allele is measured over an interval, so two intervals sharing reference
 * positions would measure the same read bases twice. Overlaps are the norm
 * rather than an edge case, because one locus is genuinely periodic at more
 * than one lag: the ABCA7 VNTR's copies are 25 and 26 bases long, so it scans
 * as a 25mer array, a 26mer array and — over the stretch where the two
 * alternate — a 77mer one, all describing the same 466 bases. Taking the
 * shortest period among the rivals reports it as the 25bp unit it is known by,
 * rather than as a 77bp unit that is three copies wearing one name.
 */
export declare function mergeArrays(arrays: ReferenceArray[], gap?: number): {
    start: number;
    end: number;
    period: number;
    unit: string;
}[];
