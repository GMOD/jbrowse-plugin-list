/**
 * Inverse of the column layout built by buildTviewMsa: the alignment emits each
 * reference position's insertion columns followed by its reference column, so a
 * flat column -> reference position array recovers the mapping.
 */
export function buildColumnToRefPos({
  start,
  end,
  insertionWidths,
}: {
  start: number
  end: number
  insertionWidths: [number, number][]
}) {
  const widths = new Map(insertionWidths)
  const ret: number[] = []
  for (let pos = start; pos < end; pos++) {
    const width = widths.get(pos) ?? 0
    for (let i = 0; i < width; i++) {
      ret.push(pos)
    }
    ret.push(pos)
  }
  return ret
}

/**
 * react-msaview drops all-gap columns from the rendering when hideGaps is
 * effective (a row is collapsed, or allowedGappyness < 100), so the column
 * index its mouse handlers report counts only visible columns. Expand it back
 * to an index into the full alignment. `blanks` is ascending.
 */
export function renderedColToMsaCol(blanks: number[], col: number) {
  let ret = col
  for (const blank of blanks) {
    if (blank <= ret) {
      ret++
    } else {
      break
    }
  }
  return ret
}
