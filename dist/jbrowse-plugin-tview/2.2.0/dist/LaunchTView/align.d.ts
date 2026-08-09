/**
 * Reads carrying the same insertion event usually differ slightly inside it
 * (sequencing error, or a real indel within the inserted allele). Laying each
 * one out left-justified puts those differences in different columns and the
 * shared event stops being readable. Aligning the inserted sequences against
 * each other fixes that.
 *
 * There are two ways to do it, and which one applies is a property of the
 * inserted sequence rather than a setting:
 *
 * - **Aperiodic** (`alignInsertions`): one center-star alignment over the whole
 *   inserted sequence. Right for a novel insertion, a mobile element, anything
 *   whose bases only make sense read straight through.
 * - **Periodic** (`alignPeriodicInsertions`): a tandem array, where the whole
 *   inserted sequence is n copies of one unit. Aligning those base-to-base is
 *   both unaffordable and wrong — it is free to align copy 5 of one read to
 *   copy 3 of another, and the difference that matters (how many copies) ends
 *   up expressed as where the row stops. Aligning unit-to-unit instead puts
 *   copy k of every read in the same columns, so copy number reads as a count
 *   of blocks and a divergent copy stands out as a column inside its block.
 *
 * Both are local to one reference position: the insertion still occupies "as
 * many columns as the widest gapped sequence", which is the only thing
 * buildColumnToRefPos knows about, so the column <-> reference mapping is
 * untouched either way.
 */
/**
 * The smallest lag at which a sequence repeats, or undefined when it does not.
 *
 * Scanning up from 1 returns the true minimal period, which is what separates a
 * tandem array from a homopolymer: `AAAA...` matches at every lag and comes back
 * as 1, and a 30bp unit comes back as 30 rather than as 60 or 90.
 */
export declare function detectPeriod(seq: string): number | undefined;
/**
 * Majority base at each offset within the unit, over the whole-length copies of
 * `seq`. The consensus is what every copy of every read is aligned to, so it has
 * to be one fixed string for the site — deriving it per read would let two reads
 * disagree about where a unit starts.
 */
export declare function consensusUnit(seq: string, period: number): string;
/**
 * How much of `seq` is explained by `unit` repeated end to end: the fraction of
 * `seq`'s bases that align to a matching base of the tiling.
 *
 * Free at both ends of the tiling, since an inserted run of copies can start
 * and stop mid-copy, and global on `seq`, since the question is about all of it.
 * That is what separates "more copies of this array" from "something else that
 * landed next to it" without asking the sequence to be in phase with the unit:
 * measured against the trio, the repeat alleles the aligner anchored just
 * outside an array score 0.94-1.00 and unrelated sequence of the same length
 * scores 0.67 or below.
 */
export declare function unitIdentity(seq: string, unit: string): number;
export interface PeriodicAlignment {
    /** repeat unit length in bp */
    period: number;
    /** each distinct input mapped to a gapped version, all the same length */
    gapped: Map<string, string>;
    /** each distinct input mapped to its copy count */
    copies: Map<string, number>;
    /** columns each copy occupies, left to right; sums to the gapped length */
    unitWidths: number[];
}
/**
 * Unit-per-block alignment of the sequences inserted at one reference position.
 *
 * Copy k of every sequence lands in the same block of columns, and a block is
 * as wide as the widest version of that copy across the site, so a sequence with
 * fewer copies runs out of blocks rather than drifting out of register. Returns
 * undefined when the site is not a tandem array, or is too big to lay out this
 * way; the caller falls back to `alignInsertions`.
 *
 * **Blocks are array order, not homology.** Copies are anchored at the left edge
 * of the insertion and counted rightward, so block k is "the kth copy along",
 * and arrays grow and shrink by unequal crossing over anywhere inside them —
 * block 9 of a 12-copy allele and block 9 of a 20-copy allele need not be the
 * same copy. What the layout does buy is that copies stay in register, so a
 * single divergent copy shows up as a column instead of shifting every copy
 * after it. Reading down one row is sound; reading across two is a hypothesis.
 */
export declare function alignPeriodicInsertions(seqs: string[]): PeriodicAlignment | undefined;
/**
 * Unit-per-block alignment against a unit the caller already knows.
 *
 * Separated from `alignPeriodicInsertions` because where the unit comes from is
 * the whole difference between the two ways of finding an array. Measured off
 * the inserted sequences, it can only be derived from one of them — the longest,
 * which is a guess that one chimeric read overturns for the whole site. Measured
 * off the reference, it is a property of the locus, so every read is laid out
 * against the same unit whatever the reads happen to be.
 */
export declare function alignToUnit(seqs: string[], consensus: string): PeriodicAlignment | undefined;
export interface InsertionAlignment {
    /** each distinct input mapped to a gapped version, all of the same length */
    gapped: Map<string, string>;
    /** present when the site is a tandem array */
    periodic?: PeriodicAlignment;
}
/**
 * Lay out the sequences inserted at one reference position, by whichever of the
 * two alignments the sequence itself calls for. The single place that decision
 * is made, so a caller reading the period cannot disagree with the layout it
 * gets.
 *
 * A tandem array goes unit-per-block, which is both the readable answer and the
 * affordable one — the size caps here are what the base-to-base alignment costs,
 * and an expansion is always past them. Everything else gets the center-star
 * alignment, or is left alone (`gapped` empty) when there is nothing to gain
 * from a single distinct sequence, or the site is too large to be worth it.
 */
export declare function alignInsertionSite(seqs: string[]): InsertionAlignment;
/**
 * The gapped sequences alone, for callers with no use for the period. Every
 * decision lives in `alignInsertionSite`.
 */
export declare function alignInsertions(seqs: string[]): Map<string, string>;
