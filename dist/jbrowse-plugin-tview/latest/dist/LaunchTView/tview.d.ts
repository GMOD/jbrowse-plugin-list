import type { ArrayBlock } from './alleles';
import type { AlignmentFeature, ReadLayout } from './readLayout';
import type { Highlight, RowDataInput } from 'react-msaview';
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
    sample?: string;
    start: number;
    refChars: string;
    query?: import("./readLayout").ReadQuery;
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
    /** the array beginning at a position, for the positions one begins at */
    arrayByStart: Map<number, ArrayBlock>;
    /**
     * Ascending, the positions a row cannot be laid out in bulk over: an array
     * block starts here, or some read inserts here. Between two of them every
     * position is one reference column, so that stretch of a row is a slice of
     * the read's own bases rather than a walk over them — which is what keeps
     * rendering proportional to the indels in a region rather than to its width.
     */
    breaks: number[];
}
/**
 * Each reference position contributes its insertion columns (widest across all
 * reads) followed by one reference column, so every row comes out the same
 * length and stays aligned — except where an array block takes over, and
 * contributes one run of columns for the whole interval it covers.
 */
export declare function buildColumnLayout(start: number, end: number, insWidths: Map<number, number>, arrays?: ArrayBlock[]): ColumnLayout;
/**
 * The reference positions a row is walked over, from inclusive to exclusive. A
 * trailing insertion is keyed one past the last position the read spans, so
 * that slot is in it.
 */
export declare function rowSpan(read: ReadLayout, layout: ColumnLayout): {
    from: number;
    to: number;
};
/**
 * Lays a single row out across the whole region. Rows are typically a tiny
 * fraction of the region, so the columns on either side are filled in one shot
 * from the offsets rather than walked position by position — which works over
 * array blocks too, since the offsets already carry their width. Inside its own
 * span a row is walked only at the layout's breaks, and copied straight out of
 * `refChars` between them.
 */
export declare function renderRow(read: ReadLayout, layout: ColumnLayout): string;
/**
 * The reference row's name, and the sample its row table entry gives it. Not
 * the sequence's own name: react-msaview prints a row's residues as
 * `<row>:<index>`, and `chr4:25` would read as a genome coordinate when it is an
 * index into the window.
 */
export declare const REFERENCE = "reference";
export interface TviewPlan {
    reads: ReadLayout[];
    /** the row each feature became, parallel to the features planned */
    featureNames: string[];
    layout: ColumnLayout;
    region: {
        refName: string;
        start: number;
        end: number;
    };
    /** rows x columns, i.e. how big the alignment renderTviewMsa builds will be */
    cellCount: number;
    /** tandem arrays the reference carries here, left to right */
    arrays: ArrayBlock[];
    /** the array the rows are ordered by, when there is one */
    subject?: ArrayBlock;
    /** name of the reference row, when the reference sequence was available */
    referenceName?: string;
    /** samples contributing rows, in the order they were given */
    samples: string[];
    /** each read's allele group within its sample, by row name */
    clusters: Map<string, string>;
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
export declare function renderRows({ reads, layout }: TviewPlan): string[];
export declare function toFasta({ reads }: TviewPlan, rows: string[]): string;
export declare function renderTviewMsa(plan: TviewPlan): string;
/**
 * What each row is, keyed by its name: the sample it came from, its allele
 * group within the sample and, where there is a subject array, the copies it
 * carries there and their length in bp.
 */
export declare function planRowData({ reads, subject, clusters, }: TviewPlan): RowDataInput;
/**
 * A bracket over the runs of columns that are not one reference base: the
 * insertion sites, and each array block. Columns are the file's, 1-based.
 */
export declare function planHighlights({ reads, layout, region, referenceName, }: TviewPlan): Highlight[];
export declare function buildTviewMsa(args: PlanArgs): {
    msa: string;
    rowData: RowDataInput;
    highlights: Highlight[];
    insertionWidths: [number, number][];
    region: {
        refName: string;
        start: number;
        end: number;
    };
    arrays: ArrayBlock[];
    subject: ArrayBlock | undefined;
};
