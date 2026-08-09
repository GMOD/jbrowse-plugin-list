/**
 * Inverse of the column layout built by buildTviewMsa: the alignment emits each
 * reference position's insertion columns followed by its reference column, so a
 * flat column -> reference position array recovers the mapping.
 *
 * An array block is the exception. Its columns are copies rather than positions,
 * and a copy is not at any one reference base — the whole point of the block is
 * that reads disagree about where the bases are. Its columns therefore ramp
 * evenly across the interval the array covers, which is right at the two edges
 * and an interpolation in between; hovering a copy lands in the array, which is
 * the honest answer.
 */
export declare function buildColumnToRefPos({ start, end, insertionWidths, arraySpans, }: {
    start: number;
    end: number;
    insertionWidths: [number, number][];
    arraySpans?: [number, number, number][];
}): number[];
/**
 * react-msaview drops all-gap columns from the rendering when hideGaps is
 * effective (a row is collapsed, or allowedGappyness < 100), so the column
 * index its mouse handlers report counts only visible columns. Expand it back
 * to an index into the full alignment. `blanks` is ascending.
 */
export declare function renderedColToMsaCol(blanks: number[], col: number): number;
