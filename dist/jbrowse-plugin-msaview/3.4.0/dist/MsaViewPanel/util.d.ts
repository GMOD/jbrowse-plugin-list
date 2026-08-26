/**
 * Whether `querySeqName` names a row this alignment actually has.
 *
 * react-msaview's `seqPosToGlobalCol` answers 0 for a name it does not know, so
 * without this every genome position maps to the first column and hovering the
 * genome — or a connected structure — lights column 0 of an unrelated row. The
 * name is wrong more often than it looks: it defaults to `QUERY`, which an
 * uploaded alignment has no reason to carry, and the manual panel leaves it
 * empty when it cannot match the protein to a row.
 *
 * The other direction has no such hole: msaCoordToGenomeRegions needs the query
 * row's sequence to map a column at all, so a missing row is already nothing
 * there.
 */
export declare function hasQueryRow(model: {
    rows: string[][];
    querySeqName: string;
}): boolean;
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
