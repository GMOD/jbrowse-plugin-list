import type { Tally } from './alleleModes';
import type { TviewPlan } from './tview';
export { alleleModes, tally } from './alleleModes';
export type { Tally } from './alleleModes';
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
    /** whether the rows were ordered by this array */
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
