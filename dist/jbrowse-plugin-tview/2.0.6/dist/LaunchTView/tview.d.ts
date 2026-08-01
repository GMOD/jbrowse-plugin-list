/** the subset of an @jbrowse/core Feature that the layout reads */
export interface AlignmentFeature {
    get: (key: string) => any;
}
export interface ReadLayout {
    name: string;
    start: number;
    /** one char per reference position consumed: the aligned base, or a gap */
    refChars: string;
    /** reference position -> bases inserted immediately before that position */
    insertions: Map<number, string>;
}
export declare function parseCigar(cigar: string): string[];
export declare function parseRead(feature: AlignmentFeature, name: string): ReadLayout;
/**
 * Reads are fetched by overlap, so they carry insertions on either side of the
 * region. Those get no columns and are never rendered, so dropping them keeps
 * the pairwise alignment below off the wasted sites entirely.
 */
export declare function clipInsertions(reads: ReadLayout[], start: number, end: number): {
    insertions: Map<number, string>;
    name: string;
    start: number;
    /** one char per reference position consumed: the aligned base, or a gap */
    refChars: string;
}[];
/**
 * Mutually aligns the sequences inserted at each reference position, so reads
 * sharing an insertion event line up inside it. Sites the aligner declines are
 * returned unchanged and stay left-justified.
 */
export declare function alignInsertionColumns(reads: ReadLayout[]): ReadLayout[];
/** widest insertion any read has at each reference position (sparse) */
export declare function maxInsertionWidths(reads: ReadLayout[]): Map<number, number>;
export interface ColumnLayout {
    start: number;
    end: number;
    insWidths: Map<number, number>;
    /**
     * column index at which each reference position's columns begin, for
     * start..end inclusive
     */
    offsets: number[];
    totalColumns: number;
}
/**
 * Each reference position contributes its insertion columns (widest across all
 * reads) followed by one reference column, so every row comes out the same
 * length and stays aligned.
 */
export declare function buildColumnLayout(start: number, end: number, insWidths: Map<number, number>): ColumnLayout;
/**
 * Lays a single read out across the whole region. Reads are typically a tiny
 * fraction of the region, so the columns on either side of the read are filled
 * in one shot rather than walked position by position.
 */
export declare function renderRow(read: ReadLayout, layout: ColumnLayout): string;
export interface TviewPlan {
    reads: ReadLayout[];
    layout: ColumnLayout;
    insertionWidths: [number, number][];
    region: {
        refName: string;
        start: number;
        end: number;
    };
    /** rows x columns, i.e. how big the alignment renderTviewMsa builds will be */
    cellCount: number;
}
/**
 * Works out the shape of the alignment without materializing it. Everything
 * here is proportional to the sequence data, unlike the render, which is
 * proportional to rows x columns and can be far larger.
 */
export declare function planTviewMsa({ features, refName, start, end, }: {
    features: AlignmentFeature[];
    refName: string;
    start: number;
    end: number;
}): TviewPlan;
export declare function renderTviewMsa({ reads, layout }: TviewPlan): string;
export declare function buildTviewMsa(args: {
    features: AlignmentFeature[];
    refName: string;
    start: number;
    end: number;
}): {
    msa: string;
    insertionWidths: [number, number][];
    region: {
        refName: string;
        start: number;
        end: number;
    };
};
