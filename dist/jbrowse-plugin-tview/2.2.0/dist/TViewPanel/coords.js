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
export function buildColumnToRefPos({ start, end, insertionWidths, arraySpans = [], }) {
    const widths = new Map(insertionWidths);
    const arrayAt = new Map(arraySpans.map(([s, e, w]) => [s, { end: e, w }]));
    const ret = [];
    let pos = start;
    while (pos < end) {
        const array = arrayAt.get(pos);
        if (array) {
            const stop = Math.min(array.end, end);
            const span = stop - pos;
            for (let i = 0; i < array.w; i++) {
                ret.push(pos + Math.min(span - 1, Math.floor((i * span) / array.w)));
            }
            pos = stop;
            continue;
        }
        const width = widths.get(pos) ?? 0;
        for (let i = 0; i < width; i++) {
            ret.push(pos);
        }
        ret.push(pos);
        pos++;
    }
    return ret;
}
/**
 * react-msaview drops all-gap columns from the rendering when hideGaps is
 * effective (a row is collapsed, or allowedGappyness < 100), so the column
 * index its mouse handlers report counts only visible columns. Expand it back
 * to an index into the full alignment. `blanks` is ascending.
 */
export function renderedColToMsaCol(blanks, col) {
    let ret = col;
    for (const blank of blanks) {
        if (blank <= ret) {
            ret++;
        }
        else {
            break;
        }
    }
    return ret;
}
//# sourceMappingURL=coords.js.map