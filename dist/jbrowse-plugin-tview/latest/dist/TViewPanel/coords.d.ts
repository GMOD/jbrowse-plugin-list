/**
 * Inverse of the column layout built by buildTviewMsa: the alignment emits each
 * reference position's insertion columns followed by its reference column, so a
 * flat column -> reference position array recovers the mapping.
 */
export declare function buildColumnToRefPos({ start, end, insertionWidths, }: {
    start: number;
    end: number;
    insertionWidths: [number, number][];
}): number[];
/**
 * react-msaview drops all-gap columns from the rendering when hideGaps is
 * effective (a row is collapsed, or allowedGappyness < 100), so the column
 * index its mouse handlers report counts only visible columns. Expand it back
 * to an index into the full alignment. `blanks` is ascending.
 */
export declare function renderedColToMsaCol(blanks: number[], col: number): number;
