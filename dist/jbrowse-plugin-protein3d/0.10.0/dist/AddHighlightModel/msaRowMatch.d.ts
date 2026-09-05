/** Removes alignment gap characters ('-' and '.') from an MSA row sequence. */
export declare function ungap(seq: string): string;
/**
 * Finds the MSA row whose ungapped sequence equals the structure's sequence.
 * For AlphaFold structures the structure sequence is the same UniProt sequence
 * as the MSA query row, so this anchors the structure to its alignment row
 * independent of row naming/ordering. Returns undefined when no row matches
 * (e.g. MSA not yet loaded), letting callers fall back to a 1:1 mapping.
 */
export declare function findStructureRowName(rowMap: Map<string, string> | undefined, structureSeq: string | undefined): string | undefined;
