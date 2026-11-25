/** the subset of an @jbrowse/core Feature that the layout reads */
export interface AlignmentFeature {
    get: (key: string) => unknown;
}
/**
 * Only '-' and '.' are treated as gaps by react-msaview (anything else counts
 * as a base in the conservation track and column stats), so the two of them
 * carry the whole vocabulary for "no base here". They are split by meaning:
 *
 * - SPANNED_GAP: the read covers this reference position but aligns no base to
 *   it, i.e. a deletion, or padding in an insertion column
 * - ABSENT: the read is not here at all, i.e. outside its bounds, or skipping
 *   over the position through an N (an intron, not a deleted allele)
 */
export declare const SPANNED_GAP = "-";
export declare const ABSENT = ".";
export declare const GAPS: RegExp;
export interface ReadLayout {
    /**
     * Identity, and the row's name in the alignment. Every per-row lookup is
     * keyed by this — the array blocks, the row table — so it is fixed once,
     * here, and nothing downstream rewrites it.
     */
    name: string;
    /** the sample the row belongs to, as the caller named it */
    sample?: string;
    start: number;
    /** one char per reference position consumed: the aligned base, or a gap */
    refChars: string;
    /** reference position -> bases inserted immediately before that position */
    insertions: Map<number, string>;
    /** where the row's bases came from in the read, for a row parsed from one */
    query?: ReadQuery;
}
/**
 * The read's own sequence, SEQ as the file stores it, and enough of its CIGAR
 * to find any base of the row in it: the query index of the first base at
 * `start`, and how many bases the aligner inserted before each position. Kept
 * as parsed, since the layout later moves and drops insertions.
 */
export interface ReadQuery {
    seq: string;
    offset: number;
    inserted: Map<number, number>;
}
export declare const byStart: (a: ReadLayout, b: ReadLayout) => number;
export declare function parseCigar(cigar: string): string[];
export declare function parseRead(feature: AlignmentFeature, name: string, sample?: string): ReadLayout;
/**
 * The query index of the first base a parsed read has at or after reference
 * position `pos`, counting what it inserted at `pos` itself as coming first.
 */
export declare function queryIndexAt(read: ReadLayout, query: ReadQuery, pos: number): number;
/**
 * Reads are fetched by overlap, so they carry insertions on either side of the
 * region. Those get no columns and are never rendered, so dropping them keeps
 * the pairwise alignment below off the wasted sites entirely.
 */
export declare function clipInsertions(reads: ReadLayout[], start: number, end: number): {
    insertions: Map<number, string>;
    /**
     * Identity, and the row's name in the alignment. Every per-row lookup is
     * keyed by this — the array blocks, the row table — so it is fixed once,
     * here, and nothing downstream rewrites it.
     */
    name: string;
    /** the sample the row belongs to, as the caller named it */
    sample?: string;
    start: number;
    /** one char per reference position consumed: the aligned base, or a gap */
    refChars: string;
    /** where the row's bases came from in the read, for a row parsed from one */
    query?: ReadQuery;
}[];
/**
 * MSA rows are keyed by name, and a FASTA defline names its row by the first
 * whitespace-delimited word, dropping any later row whose word repeats. So a
 * name loses its whitespace, mates are told apart by flag, and whatever still
 * collides (the same read in two files, or a name in `reserved`) is numbered.
 */
export declare function getReadNames(features: AlignmentFeature[], reserved?: string[]): string[];
