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
export declare function parseRowInstructions(meta: string): RowInstruction[];
export {};
