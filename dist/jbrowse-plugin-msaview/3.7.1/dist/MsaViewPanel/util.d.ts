/**
 * Whether `querySeqName` names a row this alignment actually has. The name
 * defaults to `QUERY`, which an uploaded alignment has no reason to carry, so
 * the genome and structure hovers ask this before mapping anything.
 *
 * `rowMap`, not `rows`: `rows` is what is on screen, and a query row folded
 * into a collapsed clade is still in the alignment, still has its columns, and
 * still maps.
 */
export declare function hasQueryRow(model: {
    rowMap: ReadonlyMap<string, string>;
    querySeqName: string;
}): boolean;
/**
 * The transcript a launch was started from, as it is stored: plain JSON.
 *
 * blastParams and orthologParams are frozen snapshot properties, so a Feature
 * instance put in one lives only as long as the tab. A reloaded session hands
 * back the JSON the instance serialized to, and `.get()` on that threw --
 * minutes after the EBI job the reload resubmitted had finally come back.
 */
export type TranscriptRef = Record<string, unknown> | LiveFeature;
interface LiveFeature {
    toJSON: () => Record<string, unknown>;
}
/**
 * Read the transcript's fields whichever shape it arrived in: a caller inside
 * the session may still hand over a live Feature.
 */
export declare function transcriptFields(transcript?: TranscriptRef): Record<string, unknown>;
/** what a transcript is called, preferring its name over its id */
export declare function transcriptName(transcript?: TranscriptRef): string | undefined;
interface QueryRowColumns {
    querySeqName: string;
    seqPosToVisibleCol: (rowName: string, seqPos: number) => number | undefined;
    visibleColToSeqPos: (rowName: string, visibleCol: number) => number | undefined;
}
export interface QueryRowModel extends QueryRowColumns {
    querySeqOffset: number;
}
/**
 * The visible column showing residue `seqPos` (0-based) of the query row, or
 * undefined when the row does not carry that residue or react-msaview is
 * hiding its column.
 *
 * react-msaview answers one column past the end for a position the row does not
 * have, which would light the last column for every residue beyond the row, so
 * the round trip back through visibleColToSeqPos is what rejects those.
 */
export declare function querySeqPosToVisibleCol(model: QueryRowColumns, seqPos: number): number | undefined;
/**
 * The visible column showing residue `proteinPos` (0-based) of the transcript.
 * `querySeqOffset` is what separates the two: a pasted BLAST alignment carries
 * the aligned region, not the whole protein.
 */
export declare function transcriptPosToVisibleCol(model: QueryRowModel, proteinPos: number): number | undefined;
export declare function hasHoverPosition(hovered: unknown): hovered is {
    hoverPosition: {
        coord: number;
        refName: string;
    };
};
/**
 * Extracts UniProt ID from an AlphaFold URL
 * Examples:
 * - https://alphafold.ebi.ac.uk/files/AF-P12345-F1-model_v6.cif -> P12345
 * - https://alphafold.ebi.ac.uk/files/msa/AF-P12345-F1-msa_v6.a3m -> P12345
 */
export declare function getUniprotIdFromAlphaFoldUrl(url: string): string | undefined;
export {};
