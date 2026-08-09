import type { ArrayBlock } from './alleles';
import type { AlignmentFeature, ReadLayout } from './readLayout';
export type { AlignmentFeature, ReadLayout } from './readLayout';
export { clipInsertions, parseCigar, parseRead } from './readLayout';
/**
 * Mutually aligns the sequences inserted at each reference position, so reads
 * sharing an insertion event line up inside it. Positions an array block has
 * taken over are left alone: those bases are part of an allele the block
 * already laid out, and giving them insertion columns as well would render
 * them twice.
 */
export declare function alignInsertionColumns(reads: ReadLayout[], ownedByArray: Set<number>): {
    insertions: Map<number, string>;
    name: string;
    label?: string;
    sample?: string;
    start: number;
    refChars: string;
}[];
/** widest insertion any read has at each reference position (sparse) */
export declare function maxInsertionWidths(reads: ReadLayout[], ownedByArray: Set<number>): Map<number, number>;
export interface ColumnLayout {
    start: number;
    end: number;
    insWidths: Map<number, number>;
    arrays: ArrayBlock[];
    /**
     * column index at which each reference position's columns begin, for
     * start..end inclusive. Positions inside an array block all begin where the
     * block ends: the block is one run of columns and no position inside it owns
     * any of them.
     */
    offsets: number[];
    totalColumns: number;
}
/**
 * Each reference position contributes its insertion columns (widest across all
 * reads) followed by one reference column, so every row comes out the same
 * length and stays aligned — except where an array block takes over, and
 * contributes one run of columns for the whole interval it covers.
 */
export declare function buildColumnLayout(start: number, end: number, insWidths: Map<number, number>, arrays?: ArrayBlock[]): ColumnLayout;
/**
 * Lays a single row out across the whole region. Rows are typically a tiny
 * fraction of the region, so the columns on either side are filled in one shot
 * from the offsets rather than walked position by position — which works over
 * array blocks too, since the offsets already carry their width.
 */
export declare function renderRow(read: ReadLayout, layout: ColumnLayout): string;
/**
 * What a row is called on screen. The one place `label` falls back to `name`,
 * so the defline and the tree leaf cannot disagree about it — react-msaview
 * joins them by string, and a row the tree names differently renders blank.
 */
export declare function rowLabel(read: ReadLayout): string;
/**
 * Rows ordered longest-allele-first and labelled with their copy count.
 *
 * Copy number is the measurement at a tandem array, and reading it off where a
 * row runs out is the thing the unit-per-block layout exists to avoid, so it is
 * stated in the label. Ordering by it puts the alleles in a ladder, which is
 * what makes one row's array comparable to the next at a glance. Rows that do
 * not span the array keep genomic order, below the ones that do; the reference
 * stays on top whatever its allele, since it is what the columns are named
 * after rather than one of the observations.
 */
export declare function labelAndOrderByCopies(reads: ReadLayout[], array: ArrayBlock, referenceName?: string): ReadLayout[];
export interface TviewPlan {
    reads: ReadLayout[];
    layout: ColumnLayout;
    insertionWidths: [number, number][];
    /** [start, end, width] per array block, to rebuild the column mapping */
    arraySpans: [number, number, number][];
    region: {
        refName: string;
        start: number;
        end: number;
    };
    /** rows x columns, i.e. how big the alignment renderTviewMsa builds will be */
    cellCount: number;
    /** tandem arrays the reference carries here, left to right */
    arrays: ArrayBlock[];
    /** the array the rows are ordered and labelled by, when there is one */
    subject?: ArrayBlock;
    /** name of the reference row, when the reference sequence was available */
    referenceName?: string;
    /** samples contributing rows, in the order they were given */
    samples: string[];
}
export interface PlanArgs {
    features: AlignmentFeature[];
    refName: string;
    start: number;
    end: number;
    /** reference bases for start..end, when the assembly could supply them */
    sequence?: string;
    /** which sample each feature came from, parallel to `features` */
    sampleOf?: (index: number) => string | undefined;
}
/**
 * Works out the shape of the alignment without materializing it. Everything
 * here is proportional to the sequence data, unlike the render, which is
 * proportional to rows x columns and can be far larger.
 */
export declare function planTviewMsa({ features, refName, start, end, sequence, sampleOf, }: PlanArgs): TviewPlan;
export declare function renderTviewMsa({ reads, layout }: TviewPlan): string;
export declare function buildTviewMsa(args: PlanArgs): {
    msa: string;
    insertionWidths: [number, number][];
    arraySpans: [number, number, number][];
    region: {
        refName: string;
        start: number;
        end: number;
    };
    arrays: ArrayBlock[];
    subject: ArrayBlock | undefined;
};
