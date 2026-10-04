import {
  OVERVIEW_ABSENT,
  OVERVIEW_PARTIAL,
  OVERVIEW_REFERENCE,
  OVERVIEW_VARIANT,
} from '@gmod/gbz-base'

import type { HaplotypeOverviewData } from '../GetHaplotypeOverview'

type Rgb = readonly [number, number, number]

// The variant track's colours: reference grey, so the two tracks read alike,
// and variant cells deepening with how many variant marks the bin holds
export const PALETTE = {
  absent: [244, 244, 244],
  reference: [200, 200, 200],
  partial: [224, 204, 150],
  variant: [
    [132, 166, 200],
    [64, 116, 168],
    [33, 82, 132],
    [14, 46, 86],
  ],
} as const satisfies Record<string, Rgb | readonly Rgb[]>

export const DENSITY_PX = 40
const GAP_PX = 4
const PIN_GAP_PX = 3
const PIN_ROW_PX = 14
const LABEL_MIN_PX = 9
// Past 16 kb bins nearly every bin holds a 50 bp excursion for most
// haplotypes, so the density row counts variant excursions instead of
// haplotypes per class
export const FINE_BIN_BP = 16_384

// "Diverges" rather than "variant": only excursions of 50 bp or more and
// rearrangements count, so a haplotype full of SNPs is reference-like
const CLASS_NAMES = [
  'absent: no contig covers the bin',
  'reference-like',
  'partial: contigs cover under 90% of the bin',
  'diverges',
]
const MARK_BUCKETS = [
  '1 excursion',
  '2–3 excursions',
  '4–15 excursions',
  '16+ excursions',
]
export const NOT_SHOWN = 'SNPs and indels under 50 bp are not shown'

export function cellColor(cell: number): Rgb {
  const klass = cell & 3
  return klass === OVERVIEW_ABSENT
    ? PALETTE.absent
    : klass === OVERVIEW_REFERENCE
      ? PALETTE.reference
      : klass === OVERVIEW_PARTIAL
        ? PALETTE.partial
        : PALETTE.variant[cell >> 2]!
}

export function cellLabel(cell: number) {
  const klass = cell & 3
  return klass === OVERVIEW_VARIANT
    ? `diverges ≥50 bp, ${MARK_BUCKETS[cell >> 2]}`
    : CLASS_NAMES[klass]!
}

export interface OverviewLayout {
  rows: number[]
  pinnedCount: number
  pinnedHeight: number
  restHeight: number
  rowsTop: number
  restTop: number
}

// The track's lanes first, at a height their labels fit when there is room,
// then every other haplotype unless only the lanes are wanted, sharing what
// is left. The reference sample's rows never draw.
export function overviewLayout(
  data: Pick<HaplotypeOverviewData, 'rows' | 'pinned' | 'reference'>,
  allRows: boolean,
  height: number,
): OverviewLayout {
  const skip = new Set([...data.reference, ...data.pinned])
  const pinned = data.pinned.filter(row => !data.reference.includes(row))
  const rest = allRows
    ? data.rows.flatMap((_, row) => (skip.has(row) ? [] : [row]))
    : []
  const rowsTop = DENSITY_PX + GAP_PX
  const available = Math.max(0, height - rowsTop)
  const gap = pinned.length > 0 && rest.length > 0 ? PIN_GAP_PX : 0
  const pinnedHeight =
    pinned.length === 0
      ? 0
      : Math.min(
          PIN_ROW_PX,
          (rest.length > 0 ? available * 0.4 : available) / pinned.length,
        )
  const restTop = rowsTop + pinned.length * pinnedHeight + gap
  return {
    rows: [...pinned, ...rest],
    pinnedCount: pinned.length,
    pinnedHeight,
    restHeight:
      rest.length > 0 ? Math.max(0, height - restTop) / rest.length : 0,
    rowsTop,
    restTop,
  }
}

export function rowTop(layout: OverviewLayout, index: number) {
  return index < layout.pinnedCount
    ? layout.rowsTop + index * layout.pinnedHeight
    : layout.restTop + (index - layout.pinnedCount) * layout.restHeight
}

// The haplotype row under y, or undefined over the density row or a gap
export function rowAt(layout: OverviewLayout, y: number) {
  const { pinnedCount, pinnedHeight, restHeight, rowsTop, restTop } = layout
  const pinnedEnd = rowsTop + pinnedCount * pinnedHeight
  const index =
    y >= rowsTop && y < pinnedEnd
      ? Math.floor((y - rowsTop) / pinnedHeight)
      : y >= restTop && restHeight > 0
        ? pinnedCount + Math.floor((y - restTop) / restHeight)
        : undefined
  return index !== undefined && index < layout.rows.length
    ? layout.rows[index]
    : undefined
}

// The bin holding bp, or undefined between fragments and past either end
export function binAt(data: Pick<HaplotypeOverviewData, 'bins'>, bp: number) {
  const { bins } = data
  let lo = 0
  let hi = bins.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (bins[mid]!.start <= bp) {
      lo = mid
    } else {
      hi = mid - 1
    }
  }
  const bin = bins[lo]
  return bin && bin.start <= bp && bp < bin.end ? lo : undefined
}

// Per bin, the haplotypes that are not the reference counted by what the
// density row stacks: absent, partial, and variant in each mark bucket
export function densityCounts(data: HaplotypeOverviewData) {
  const height = data.rows.length
  const reference = new Set(data.reference)
  return data.bins.map((_, b) => {
    const counts = [0, 0, 0, 0, 0, 0]
    for (let row = 0; row < height; row++) {
      if (!reference.has(row)) {
        const cell = data.cells[b * height + row]!
        const klass = cell & 3
        if (klass === OVERVIEW_VARIANT) {
          counts[2 + (cell >> 2)]! += 1
        } else if (klass === OVERVIEW_ABSENT) {
          counts[0]! += 1
        } else if (klass === OVERVIEW_PARTIAL) {
          counts[1]! += 1
        }
      }
    }
    return counts
  })
}

export function describeBin(data: HaplotypeOverviewData, b: number) {
  const bin = data.bins[b]!
  const [absent, reference, partial, variant] = bin.classes
  return {
    span: `${bin.start.toLocaleString()}–${bin.end.toLocaleString()}`,
    classes: `${reference} reference-like, ${variant} diverge ≥50 bp, ${partial} partial, ${absent} absent`,
    excursions: `${bin.excursions.toLocaleString()} excursions, ${bin.variants.toLocaleString()} of 50 bp or more, longest ${bin.longestExcursion.toLocaleString()} bp`,
  }
}

interface Frame {
  // screen x of a bp on the overview's contig
  xOf: (bp: number) => number
  width: number
  height: number
  dpr: number
}

function makeCanvas(width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, width)
  canvas.height = Math.max(1, height)
  return canvas
}

// Consecutive bins with no gap between them, which one image can stretch over
function contiguousRuns(data: HaplotypeOverviewData) {
  const runs: [number, number][] = []
  let first = 0
  data.bins.forEach((bin, b) => {
    if (b > 0 && bin.start !== data.bins[b - 1]!.end) {
      runs.push([first, b])
      first = b
    }
  })
  if (data.bins.length > 0) {
    runs.push([first, data.bins.length])
  }
  return runs
}

export interface RowImage {
  image: HTMLCanvasElement
  top: number
  height: number
}

// One image per group of rows, built once per overview and layout: a pixel
// per cell, scaled to the group's device height with smoothing only when
// rows outnumber pixels
function rowImage(
  data: HaplotypeOverviewData,
  rows: number[],
  top: number,
  height: number,
  dpr: number,
): RowImage | undefined {
  const cols = data.bins.length
  if (rows.length === 0 || cols === 0 || height <= 0) {
    return undefined
  }
  const cells = makeCanvas(cols, rows.length)
  const cellsCtx = cells.getContext('2d')!
  const pixels = cellsCtx.createImageData(cols, rows.length)
  const stride = data.rows.length
  rows.forEach((row, y) => {
    for (let b = 0; b < cols; b++) {
      const [r, g, bl] = cellColor(data.cells[b * stride + row]!)
      const o = (y * cols + b) * 4
      pixels.data[o] = r
      pixels.data[o + 1] = g
      pixels.data[o + 2] = bl
      pixels.data[o + 3] = 255
    }
  })
  cellsCtx.putImageData(pixels, 0, 0)
  const devHeight = Math.max(1, Math.round(height * dpr))
  const image = makeCanvas(cols, devHeight)
  const ctx = image.getContext('2d')!
  ctx.imageSmoothingEnabled = rows.length > devHeight
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(cells, 0, 0, cols, devHeight)
  return { image, top, height }
}

export function rowImages(
  data: HaplotypeOverviewData,
  layout: OverviewLayout,
  dpr: number,
) {
  const { rows, pinnedCount, pinnedHeight, restHeight } = layout
  return [
    rowImage(
      data,
      rows.slice(0, pinnedCount),
      layout.rowsTop,
      pinnedCount * pinnedHeight,
      dpr,
    ),
    rowImage(
      data,
      rows.slice(pinnedCount),
      layout.restTop,
      (rows.length - pinnedCount) * restHeight,
      dpr,
    ),
  ].filter(image => image !== undefined)
}

// The screen span of bp [start, end), which runs right to left on a
// reversed block
function screenSpan(frame: Frame, start: number, end: number) {
  const a = frame.xOf(start)
  const b = frame.xOf(end)
  return { left: Math.min(a, b), width: Math.abs(b - a), reversed: b < a }
}

// Each run of bins stretched to its bp, smoothed only when bins outnumber
// pixels, and mirrored on a reversed block
function blitRows(
  ctx: CanvasRenderingContext2D,
  data: HaplotypeOverviewData,
  images: RowImage[],
  frame: Frame,
) {
  for (const [first, end] of contiguousRuns(data)) {
    const { left, width, reversed } = screenSpan(
      frame,
      data.bins[first]!.start,
      data.bins[end - 1]!.end,
    )
    if (left + width < 0 || left > frame.width) {
      continue
    }
    ctx.imageSmoothingEnabled = end - first > width * frame.dpr
    for (const { image, top, height } of images) {
      ctx.save()
      if (reversed) {
        ctx.translate(2 * left + width, 0)
        ctx.scale(-1, 1)
      }
      ctx.drawImage(
        image,
        first,
        0,
        end - first,
        image.height,
        left,
        top,
        width,
        height,
      )
      ctx.restore()
    }
  }
}

function drawDensity(
  ctx: CanvasRenderingContext2D,
  data: HaplotypeOverviewData,
  counts: number[][] | undefined,
  frame: Frame,
) {
  const total = data.rows.length - data.reference.length
  const most = Math.max(1, ...data.bins.map(bin => bin.variants))
  const stack: Rgb[] = [[175, 175, 175], PALETTE.partial, ...PALETTE.variant]
  data.bins.forEach((bin, b) => {
    const span = screenSpan(frame, bin.start, bin.end)
    const { left } = span
    const width = Math.max(span.width, 1 / frame.dpr)
    if (left + width < 0 || left > frame.width) {
      return
    }
    if (counts) {
      let y = DENSITY_PX
      for (const i of [5, 4, 3, 2, 1, 0]) {
        const h = (DENSITY_PX * counts[b]![i]!) / Math.max(1, total)
        if (h > 0) {
          const [r, g, bl] = stack[i]!
          ctx.fillStyle = `rgb(${r},${g},${bl})`
          ctx.fillRect(left, y - h, width, h)
          y -= h
        }
      }
    } else {
      const h = (DENSITY_PX * bin.variants) / most
      const [r, g, bl] = PALETTE.variant[1]
      ctx.fillStyle = `rgb(${r},${g},${bl})`
      ctx.fillRect(left, DENSITY_PX - h, width, h)
    }
  })
}

function drawLabels(
  ctx: CanvasRenderingContext2D,
  data: HaplotypeOverviewData,
  layout: OverviewLayout,
) {
  if (layout.pinnedHeight < LABEL_MIN_PX) {
    return
  }
  ctx.font = `${Math.min(11, layout.pinnedHeight - 2)}px sans-serif`
  ctx.textBaseline = 'middle'
  for (let i = 0; i < layout.pinnedCount; i++) {
    const label = data.rows[layout.rows[i]!]!
    const y = rowTop(layout, i)
    const w = ctx.measureText(label).width
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillRect(2, y + 1, w + 6, layout.pinnedHeight - 2)
    ctx.fillStyle = '#222'
    ctx.fillText(label, 5, y + layout.pinnedHeight / 2)
  }
}

function formatBp(bp: number) {
  return bp >= 1_000_000
    ? `${+(bp / 1_000_000).toFixed(1)} Mb`
    : `${+(bp / 1000).toFixed(1)} kb`
}

// What the density band counts, which changes with the bin size
export function densityLabel(data: HaplotypeOverviewData) {
  const haplotypes = data.rows.length - data.reference.length
  return data.bin <= FINE_BIN_BP
    ? `haplotypes diverging ≥50 bp, of ${haplotypes} · ${formatBp(data.bin)} bins`
    : `excursions ≥50 bp per ${formatBp(data.bin)} bin, all ${haplotypes} haplotypes`
}

function drawDensityLabel(
  ctx: CanvasRenderingContext2D,
  data: HaplotypeOverviewData,
) {
  const label = densityLabel(data)
  ctx.font = '10px sans-serif'
  ctx.textBaseline = 'top'
  const w = ctx.measureText(label).width
  ctx.fillStyle = 'rgba(255,255,255,0.8)'
  ctx.fillRect(2, 1, w + 6, 13)
  ctx.fillStyle = '#444'
  ctx.fillText(label, 5, 2)
}

// The density band from per-class counts at bins up to FINE_BIN_BP, from
// excursion counts past them (undefined counts)
export function drawOverview(
  ctx: CanvasRenderingContext2D,
  data: HaplotypeOverviewData,
  counts: number[][] | undefined,
  layout: OverviewLayout,
  images: RowImage[],
  frame: Frame,
) {
  ctx.clearRect(0, 0, frame.width, frame.height)
  drawDensity(ctx, data, counts, frame)
  blitRows(ctx, data, images, frame)
  drawLabels(ctx, data, layout)
  drawDensityLabel(ctx, data)
}
