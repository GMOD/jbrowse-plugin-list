import type { TviewPlan } from './tview';
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
export interface SampleArrayStats {
    sample: string;
    /** rows that reached both ends of the interval, i.e. that were measured */
    spanning: number;
    /** the alleles found, each with the reads counted into it */
    modes: Tally[];
    /** every copy count seen, with its support */
    copies: Tally[];
    /** rows counted into no allele at all */
    offMode: number;
}
export interface ArrayStats {
    start: number;
    end: number;
    period: number;
    unit: string;
    /** reference positions the interval covers */
    span: number;
    /** columns the block occupies */
    width: number;
    /** the reference's own copy count, when the reference was a row */
    referenceCopies?: number;
    /** whether the rows were ordered and labelled by this array */
    subject: boolean;
    samples: SampleArrayStats[];
}
export interface PlanStats {
    rows: number;
    columns: number;
    /**
     * columns exactly one row has a base in. One read's miscalled indel costs
     * every row a column, so this is the size of what "hide columns w/ N% gaps"
     * takes off a figure — read error, measured rather than estimated.
     */
    singleRowColumns: number;
    /** columns no row has a base in, which no setting is needed to justify */
    emptyColumns: number;
    arrays: ArrayStats[];
}
/** Rows, columns, and every array, from a plan the view could equally render. */
export declare function summarizePlan(plan: TviewPlan, samples?: string[]): PlanStats;
