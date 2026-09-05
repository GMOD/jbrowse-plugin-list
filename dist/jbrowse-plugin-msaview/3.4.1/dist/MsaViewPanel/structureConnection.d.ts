export interface ProteinViewStructure {
    url?: string;
    connectedViewId?: string;
    uniprotId?: string;
    structureSequences?: string[];
    /** the residue under the pointer, transient */
    hoverGenomeHighlights?: {
        start: number;
        end: number;
    }[];
    /** the clicked domain, persistent; also what `initialSelection` lights */
    clickGenomeHighlights?: {
        start: number;
        end: number;
    }[];
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
 * Helper to convert gapped MSA column to ungapped position for a specific row
 */
export declare function gappedToUngappedPosition(sequence: string, gappedPosition: number): number | undefined;
