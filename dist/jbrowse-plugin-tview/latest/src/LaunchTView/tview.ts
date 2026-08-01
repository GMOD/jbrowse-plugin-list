import { alignInsertions } from './align'

/** the subset of an @jbrowse/core Feature that the layout reads */
export interface AlignmentFeature {
  get: (key: string) => any
}

/**
 * Only '-' and '.' are treated as gaps by react-msaview (anything else counts
 * as a base in the conservation track and column stats), so the two of them
 * carry the whole vocabulary for "no base here". They are split by meaning:
 *
 * - SPANNED_GAP: the read covers this reference position but aligns no base to
 *   it, i.e. a deletion, or padding in an insertion column
 * - ABSENT: the read is not here at all, i.e. outside its bounds, or skipping
 *   over the position through an N (an intron, not a deleted allele)
 */
const SPANNED_GAP = '-'
const ABSENT = '.'

export interface ReadLayout {
  name: string
  start: number
  /** one char per reference position consumed: the aligned base, or a gap */
  refChars: string
  /** reference position -> bases inserted immediately before that position */
  insertions: Map<number, string>
}

const cigarRegex = /([MIDNSHPX=])/

const byStart = (a: ReadLayout, b: ReadLayout) => a.start - b.start

export function parseCigar(cigar: string) {
  return cigar.split(cigarRegex).slice(0, -1)
}

export function parseRead(feature: AlignmentFeature, name: string): ReadLayout {
  const seq = feature.get('seq') as string
  const ops = parseCigar(feature.get('CIGAR') as string)
  const start = feature.get('start')
  const insertions = new Map<number, string>()
  let refChars = ''
  let seqOffset = 0

  for (let i = 0; i < ops.length; i += 2) {
    const len = +ops[i]!
    const op = ops[i + 1]!
    if (op === 'S') {
      seqOffset += len
    } else if (op === 'I') {
      // consecutive I ops (e.g. 3M2I3I3M) land on the same reference position
      const pos = start + refChars.length
      const prev = insertions.get(pos) ?? ''
      insertions.set(pos, prev + seq.slice(seqOffset, seqOffset + len))
      seqOffset += len
    } else if (op === 'D') {
      refChars += SPANNED_GAP.repeat(len)
    } else if (op === 'N') {
      refChars += ABSENT.repeat(len)
    } else if (op === 'M' || op === 'X' || op === '=') {
      refChars += seq.slice(seqOffset, seqOffset + len)
      seqOffset += len
    }
    // H and P consume neither the read sequence nor the reference
  }
  return { name, start, refChars, insertions }
}

/**
 * Reads are fetched by overlap, so they carry insertions on either side of the
 * region. Those get no columns and are never rendered, so dropping them keeps
 * the pairwise alignment below off the wasted sites entirely.
 */
export function clipInsertions(
  reads: ReadLayout[],
  start: number,
  end: number,
) {
  return reads.map(read => ({
    ...read,
    insertions: new Map(
      [...read.insertions].filter(([pos]) => pos >= start && pos < end),
    ),
  }))
}

/**
 * Mutually aligns the sequences inserted at each reference position, so reads
 * sharing an insertion event line up inside it. Sites the aligner declines are
 * returned unchanged and stay left-justified.
 */
export function alignInsertionColumns(reads: ReadLayout[]): ReadLayout[] {
  const byPos = new Map<number, string[]>()
  for (const read of reads) {
    for (const [pos, ins] of read.insertions) {
      const seqs = byPos.get(pos)
      if (seqs) {
        seqs.push(ins)
      } else {
        byPos.set(pos, [ins])
      }
    }
  }
  const gapped = new Map(
    [...byPos].map(([pos, seqs]) => [pos, alignInsertions(seqs)] as const),
  )
  return reads.map(read => ({
    ...read,
    insertions: new Map(
      [...read.insertions].map(([pos, ins]) => [
        pos,
        gapped.get(pos)?.get(ins) ?? ins,
      ]),
    ),
  }))
}

/** widest insertion any read has at each reference position (sparse) */
export function maxInsertionWidths(reads: ReadLayout[]) {
  const ret = new Map<number, number>()
  for (const read of reads) {
    for (const [pos, ins] of read.insertions) {
      ret.set(pos, Math.max(ret.get(pos) ?? 0, ins.length))
    }
  }
  return ret
}

export interface ColumnLayout {
  start: number
  end: number
  insWidths: Map<number, number>
  /**
   * column index at which each reference position's columns begin, for
   * start..end inclusive
   */
  offsets: number[]
  totalColumns: number
}

/**
 * Each reference position contributes its insertion columns (widest across all
 * reads) followed by one reference column, so every row comes out the same
 * length and stays aligned.
 */
export function buildColumnLayout(
  start: number,
  end: number,
  insWidths: Map<number, number>,
): ColumnLayout {
  const offsets = [0]
  let col = 0
  for (let pos = start; pos < end; pos++) {
    col += (insWidths.get(pos) ?? 0) + 1
    offsets.push(col)
  }
  return { start, end, insWidths, offsets, totalColumns: col }
}

/**
 * Lays a single read out across the whole region. Reads are typically a tiny
 * fraction of the region, so the columns on either side of the read are filled
 * in one shot rather than walked position by position.
 */
export function renderRow(read: ReadLayout, layout: ColumnLayout) {
  const { start, end, insWidths, offsets, totalColumns } = layout
  // a trailing insertion is keyed one past the last position the read spans
  const from = Math.max(start, read.start)
  const to = Math.min(end, read.start + read.refChars.length + 1)

  let ret: string
  if (to > from) {
    ret = ABSENT.repeat(offsets[from - start]!)
    for (let pos = from; pos < to; pos++) {
      const idx = pos - read.start
      const spanned = idx >= 0 && idx < read.refChars.length
      const refChar = spanned ? read.refChars[idx]! : ABSENT
      const width = insWidths.get(pos) ?? 0
      if (width) {
        // a read that is not really here pads the insertion the same way it
        // pads the reference column, so an intron reads as one absence
        const pad = refChar === ABSENT ? ABSENT : SPANNED_GAP
        const ins = read.insertions.get(pos) ?? ''
        ret += ins + pad.repeat(width - ins.length)
      }
      ret += refChar
    }
    ret += ABSENT.repeat(totalColumns - offsets[to - start]!)
  } else {
    ret = ABSENT.repeat(totalColumns)
  }
  return ret
}

function mateSuffix(flags: number | undefined) {
  return flags === undefined || !(flags & 1) ? '' : flags & 64 ? '/1' : '/2'
}

/** MSA rows are keyed by name, so mates and duplicate names need disambiguating */
function getReadNames(features: AlignmentFeature[]) {
  const counts = new Map<string, number>()
  return features.map(f => {
    const base = `${f.get('name')}${mateSuffix(f.get('flags'))}`
    const n = (counts.get(base) ?? 0) + 1
    counts.set(base, n)
    return n === 1 ? base : `${base}_${n}`
  })
}

export interface TviewPlan {
  reads: ReadLayout[]
  layout: ColumnLayout
  insertionWidths: [number, number][]
  region: { refName: string; start: number; end: number }
  /** rows x columns, i.e. how big the alignment renderTviewMsa builds will be */
  cellCount: number
}

/**
 * Works out the shape of the alignment without materializing it. Everything
 * here is proportional to the sequence data, unlike the render, which is
 * proportional to rows x columns and can be far larger.
 */
export function planTviewMsa({
  features,
  refName,
  start,
  end,
}: {
  features: AlignmentFeature[]
  refName: string
  start: number
  end: number
}): TviewPlan {
  const names = getReadNames(features)
  const reads = alignInsertionColumns(
    clipInsertions(
      features.map((f, i) => parseRead(f, names[i]!)).sort(byStart),
      start,
      end,
    ),
  )
  const insWidths = maxInsertionWidths(reads)
  const layout = buildColumnLayout(start, end, insWidths)

  return {
    reads,
    layout,
    insertionWidths: [...insWidths.entries()].sort((a, b) => a[0] - b[0]),
    region: { refName, start, end },
    cellCount: reads.length * layout.totalColumns,
  }
}

export function renderTviewMsa({ reads, layout }: TviewPlan) {
  return reads.map(r => `>${r.name}\n${renderRow(r, layout)}\n`).join('')
}

export function buildTviewMsa(args: {
  features: AlignmentFeature[]
  refName: string
  start: number
  end: number
}) {
  const plan = planTviewMsa(args)
  return {
    msa: renderTviewMsa(plan),
    insertionWidths: plan.insertionWidths,
    region: plan.region,
  }
}
