/**
 * Calling the copy counts a sample's reads carry at one array, kept apart from
 * repeatStats so the read clustering can call them without importing the plan
 * builder back.
 */
export interface Tally {
    value: number;
    reads: number;
}
/** Each distinct value with how many rows carried it, smallest value first. */
export declare function tally(values: number[]): Tally[];
/**
 * The copy counts a sample carries, each with the reads that fell on it or in
 * its skirt.
 *
 * Reads scatter around an allele — slippage in the molecule, slippage in the
 * aligner — so a rule that reported only exact agreement credited an allele
 * with a fraction of the reads that actually support it, and left the rest
 * looking like disagreement. Counts are gathered strongest first, so an allele
 * is established before anything can be read as its shoulder, and a value joins
 * one only if it is both near it and much weaker than it.
 *
 * This is a report of what the reads say, not a genotype call: it does not know
 * a ploidy, so a homozygote and a haploid locus both come back as one number,
 * and a sample whose reads scatter can come back with none.
 */
export declare function alleleModes(copies: number[]): Tally[];
