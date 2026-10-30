import type { WalkRowBlock } from '@jbrowse/bandage-core/layout/walkRowLinks'

// ggbandage's: the three biggest blocks in colour, the rest a pale grey that
// still carries its letter
const BLOCK_COLORS = ['#d4735e', '#d8a94a', '#c98aa4']
const OTHER_BLOCK = '#e6e6e6'
const BLOCK_EDGE = '#555'
const LETTER_FONT = 'bold 11px sans-serif'
const MIN_LETTER_PX = 12
const MIN_LETTER_BAR_PX = 9

export const blockFill = (block: number) => BLOCK_COLORS[block] ?? OTHER_BLOCK

// A, B, ... Z, then AA, AB, ...
export function blockLetter(block: number): string {
  const letter = String.fromCharCode(65 + (block % 26))
  return block < 26 ? letter : blockLetter(Math.floor(block / 26) - 1) + letter
}

// How many blocks get a colour of their own, for the key
export const COLORED_BLOCKS = BLOCK_COLORS.length

// Each stretch as a box over its row's bar, lettered where it is wide enough
export function paintWalkRowBlocks(
  ctx: CanvasRenderingContext2D,
  blocks: WalkRowBlock[],
  f: {
    x: (offset: number) => number
    rowCentre: (row: number) => number
    barPx: number
  },
) {
  ctx.font = LETTER_FONT
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (const { row, start, bp, block } of blocks) {
    const left = f.x(start)
    const width = f.x(start + bp) - left
    const top = f.rowCentre(row) - f.barPx / 2
    ctx.fillStyle = blockFill(block)
    ctx.fillRect(left, top, width, f.barPx)
    ctx.strokeStyle = BLOCK_EDGE
    ctx.lineWidth = 1
    ctx.strokeRect(left + 0.5, top + 0.5, width - 1, f.barPx - 1)
    if (width >= MIN_LETTER_PX && f.barPx >= MIN_LETTER_BAR_PX) {
      ctx.fillStyle = '#111'
      ctx.fillText(blockLetter(block), left + width / 2, f.rowCentre(row))
    }
  }
}
