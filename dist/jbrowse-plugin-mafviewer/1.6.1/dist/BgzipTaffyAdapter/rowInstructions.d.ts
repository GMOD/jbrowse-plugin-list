/**
 * TAF (Taffy Alignment Format) row instruction types
 * Reference: https://github.com/ComparativeGenomicsToolkit/taffy
 *
 * Instruction types:
 * 'i' - insert: add a new sequence row
 * 's' - substitute: replace coordinates of an existing row
 * 'd' - delete: remove a sequence row
 * 'g' - gap: add a fixed-length gap to sequence start
 * 'G' - gap substring: add variable-length gap from substring
 */
interface RowInsert {
    type: 'i';
    row: number;
    sequenceName: string;
    start: number;
    strand: number;
    sequenceLength: number;
}
interface RowSubstitute {
    type: 's';
    row: number;
    sequenceName: string;
    start: number;
    strand: number;
    sequenceLength: number;
}
interface RowDelete {
    type: 'd';
    row: number;
}
interface RowGap {
    type: 'g';
    row: number;
    gapLength: number;
}
interface RowGapSubstring {
    type: 'G';
    row: number;
    gapSubstring: string;
}
export type RowInstruction = RowInsert | RowDelete | RowGap | RowGapSubstring | RowSubstitute;
export declare function filterFirstLineInstructions(instructions: RowInstruction[]): RowInstruction[];
/**
 * Parses TAF row instruction string into structured RowInstruction objects
 * Each instruction token sequence is parsed according to TAF format rules
 */
export declare function parseRowInstructions(meta: string): RowInstruction[];
export {};
