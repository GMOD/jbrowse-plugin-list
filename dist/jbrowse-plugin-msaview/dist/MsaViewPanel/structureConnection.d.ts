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
    /** Map from structure sequence position to MSA ungapped position */
    structureToMsa: Record<number, number>;
}
/**
 * Helper to convert gapped MSA column to ungapped position for a specific row
 */
export declare function gappedToUngappedPosition(sequence: string, gappedPosition: number): number | undefined;
/**
 * Helper to convert ungapped position to gapped MSA column for a specific row
 */
export declare function ungappedToGappedPosition(sequence: string, ungappedPosition: number): number | undefined;
/**
 * Convert Map to plain object for MST frozen storage
 */
export declare function mapToRecord(map: Map<number, number>): Record<number, number>;
