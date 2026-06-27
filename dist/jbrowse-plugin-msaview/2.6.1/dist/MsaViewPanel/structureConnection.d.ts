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
