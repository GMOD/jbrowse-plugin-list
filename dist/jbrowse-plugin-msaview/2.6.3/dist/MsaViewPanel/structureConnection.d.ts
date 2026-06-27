export interface ProteinViewStructure {
    url?: string;
    connectedViewId?: string;
    uniprotId?: string;
    structureSequences?: string[];
    hoverGenomeHighlights?: {
        start: number;
        end: number;
    }[];
    hoverPosition?: {
        structureSeqPos?: number;
    };
    clearHighlightFromExternal?: () => void;
    highlightFromExternal?: (pos: number) => void;
}
export interface ProteinView {
    type: 'ProteinView';
    id: string;
    displayName?: string;
    structures: ProteinViewStructure[];
}
export declare function isProteinView(view: unknown): view is ProteinView;
/**
 * Extract all ProteinView instances from a session's views array.
 */
export declare function getProteinViews(views: {
    type: string;
}[]): ProteinView[];
/**
 * Whether a 3D structure belongs to a given alignment — the single source of
 * truth for pairing an MsaView with a ProteinView's structure. A structure
 * matches when it either:
 *  - shares the alignment's genome view (both pinned to the same
 *    LinearGenomeView via `connectedViewId` — the genome-centric gene-explorer
 *    flow, the same key genome↔MSA and genome↔structure already bridge through),
 *    or
 *  - shares the alignment's UniProt accession (the BLAST/AlphaFold flow, which
 *    has no genome view to bridge through).
 *
 * The residue map itself is built by sequence (connectToStructure pairwise-
 * aligns the query row against the structure), so neither key is mechanically
 * required — they only scope WHICH structure pairs with the alignment.
 */
export declare function structureMatchesMsa({ structure, connectedViewId, uniprotId, }: {
    structure: Pick<ProteinViewStructure, 'connectedViewId' | 'uniprotId'>;
    connectedViewId?: string;
    uniprotId?: string;
}): boolean;
/**
 * Represents a connection between the MSA view and a protein structure
 */
export interface StructureConnection {
    /** ID of the ProteinView containing the structure */
    proteinViewId: string;
    /** Index of the structure within the ProteinView's structures array */
    structureIdx: number;
    /** Name of the MSA row that corresponds to this structure */
    msaRowName: string;
    /** Map from MSA ungapped position to structure sequence position */
    msaToStructure: Record<number, number>;
}
/**
 * Helper to convert gapped MSA column to ungapped position for a specific row
 */
export declare function gappedToUngappedPosition(sequence: string, gappedPosition: number): number | undefined;
