import type { GraphTables } from '@jbrowse/bandage-core/gfa/graphTables'
import type {
  WalkAxis,
  WalkRow,
  WalkRows,
  WalkRun,
} from '@jbrowse/bandage-core/layout/walkRows'

const RUN_ON_REFERENCE = 1
const RUN_REVERSED = 2
const RUN_GAP = 4

type WalkRowMeta = Omit<WalkRow, 'runs'>

/**
 * A walk-file cut for walk rows: the tables, and the rows' runs over the
 * window, which the main thread draws without a Graph of the walks' steps
 */
export type WalkCut = GraphTables & { walkRowRuns?: WalkRowRuns }

export function walkCutFor(
  tables: GraphTables,
  region: { start: number; end: number },
  walkRows: boolean | undefined,
): WalkCut {
  return walkRows
    ? { ...tables, walkRowRuns: walkRowRuns(tables, region) }
    : tables
}

/**
 * bandage-core's `walkRows` over a cut's tables, each row's runs as typed
 * arrays that cross from the worker beside the tables. Row 0 is the
 * reference.
 */
export interface WalkRowRuns {
  origin: number
  rows: WalkRowMeta[]
  offsets: Uint32Array
  start: Float64Array
  bp: Float64Array
  referenceStart: Float64Array
  flags: Uint8Array
}

function walkFields(panSN: string) {
  const [sample = '', haplotype = '', ...contig] = panSN.split('#')
  return { sample, haplotype: +haplotype, contig: contig.join('#') }
}

interface Path {
  name: string
  sample: string
  haplotype: number
  contig: string
  start: number
  from: number
  to: number
}

class RunWriter {
  start: number[] = []
  bp: number[] = []
  referenceStart: number[] = []
  flags: number[] = []
  offsets = [0]

  get length() {
    return this.bp.length
  }

  push(start: number, bp: number, flags: number, referenceStart: number) {
    this.start.push(start)
    this.bp.push(bp)
    this.flags.push(flags)
    this.referenceStart.push(referenceStart)
  }

  endRow() {
    this.offsets.push(this.bp.length)
  }
}

/**
 * `walkRows(graphFromTables(tables), region)` for a graph anchored by its
 * node tags, which is every walk-file cut: the first walk is the reference,
 * and a step is a node index. A gap between two pieces of one haplotype is a
 * step of `-bp`. One difference: a walk reaching only one of the region's
 * flanks measures from that flank, where walkRows takes the whole walk the
 * cut holds, so its length is a lower bound that no longer grows with the
 * cut's context.
 */
export function walkRowRuns(
  { nodes: n, walks: w }: GraphTables,
  region?: { start: number; end: number },
): WalkRowRuns | undefined {
  const declared = n.lengths.length
  const lengthOf = (node: number) => (node < declared ? n.lengths[node]! : 0)
  const paths: Path[] = []
  for (let p = 0; p < w.names.length; p++) {
    if (w.offsets[p + 1]! > w.offsets[p]!) {
      const { sample, haplotype, contig } = walkFields(w.names[p]!)
      paths.push({
        name: `${sample}#${haplotype}#${contig}`,
        sample,
        haplotype,
        contig,
        start: w.starts[p]!,
        from: w.offsets[p]!,
        to: w.offsets[p + 1]!,
      })
    }
  }
  const [first, ...others] = paths
  if (!first || others.length === 0) {
    return undefined
  }
  const walks = new Map<string, Path[]>()
  for (const path of others) {
    const list = walks.get(path.name)
    if (list) {
      list.push(path)
    } else {
      walks.set(path.name, [path])
    }
  }

  const spanStart = new Float64Array(n.names.length).fill(Number.NaN)
  const spanEnd = new Float64Array(n.names.length)
  let flankedBefore = false
  let flankedAfter = false
  const cut = region && region.end > region.start ? region : undefined
  {
    let pos = first.start
    for (let s = first.from; s < first.to; s++) {
      const node = w.steps[s]!
      const len = lengthOf(node)
      if (Number.isNaN(spanStart[node]!)) {
        spanStart[node] = pos
        spanEnd[node] = pos + len
        if (cut) {
          flankedBefore ||= pos + len <= cut.start
          flankedAfter ||= pos >= cut.end
        }
      }
      pos += len
    }
  }
  const flanked = cut === undefined || (flankedBefore && flankedAfter)

  const out = new RunWriter()
  let steps = new Int32Array(0)
  let stepStart = new Float64Array(0)
  const rowOf = (pieces: Path[]): WalkRowMeta => {
    const path = pieces[0]!
    const ordered = [...pieces].sort((a, b) => a.start - b.start)
    // the walk's steps, each piece's gap from the last as a step of -bp
    let count = ordered.length - 1
    for (const piece of ordered) {
      count += piece.to - piece.from
    }
    if (count > steps.length) {
      steps = new Int32Array(count * 2)
      stepStart = new Float64Array(count * 2)
    }
    let length = 0
    let overlaps = false
    let end: number | undefined
    for (const piece of ordered) {
      if (end !== undefined && piece.start < end) {
        overlaps = true
      }
      if (end !== undefined && piece.start > end) {
        steps[length] = -(piece.start - end)
        stepStart[length++] = end
      }
      let pos = piece.start
      for (let s = piece.from; s < piece.to; s++) {
        const node = w.steps[s]!
        steps[length] = node
        stepStart[length++] = pos
        pos += node < declared ? n.lengths[node]! : 0
      }
      end = pos
    }
    // A walk with one flank, whose contig ends inside the window: the steps
    // past that flank, read in the reference's direction. Which side is
    // inside follows the walk's direction along the reference at the
    // flank, from the nearest other step on it.
    const partialSide = (i0: number, i1: number) => {
      const flank = i0 >= 0 ? i0 : i1
      let near = -1
      for (let d = 1; near < 0 && d < length; d++) {
        for (const j of [flank - d, flank + d]) {
          const id = j >= 0 && j < length ? steps[j]! : -1
          if (near < 0 && id >= 0 && !Number.isNaN(spanStart[id]!)) {
            near = j
          }
        }
      }
      if (near < 0) {
        return undefined
      }
      const forward =
        near > flank === spanStart[steps[near]!]! > spanStart[steps[flank]!]!
      const after = forward === (flank === i0)
      return {
        lo: after ? flank + 1 : 0,
        hi: after ? length : flank,
        backward: !forward,
        axisStart: forward
          ? after
            ? stepEnd(flank)
            : stepStart[0]!
          : after
            ? stepEnd(length - 1)
            : stepStart[flank]!,
      }
    }
    const stepEnd = (i: number) => {
      const id = steps[i]!
      return stepStart[i]! + (id < 0 ? -id : lengthOf(id))
    }

    let lo = 0
    let hi = length
    let backward = false
    let complete = true
    let from = -1
    let to = -1
    let axisStart: number | undefined
    if (cut && flanked) {
      let i0 = -1
      let i1 = -1
      let bestEnd = -Infinity
      let bestStart = Infinity
      for (let i = 0; i < length; i++) {
        const id = steps[i]!
        if (id >= 0 && !Number.isNaN(spanStart[id]!)) {
          if (spanEnd[id]! <= cut.start && spanEnd[id]! > bestEnd) {
            bestEnd = spanEnd[id]!
            i0 = i
          }
          if (spanStart[id]! >= cut.end && spanStart[id]! < bestStart) {
            bestStart = spanStart[id]!
            i1 = i
          }
        }
      }
      if (i0 < 0 || i1 < 0) {
        complete = false
        const inside = i0 >= 0 || i1 >= 0 ? partialSide(i0, i1) : undefined
        if (inside) {
          ;({ lo, hi, backward, axisStart } = inside)
        }
      } else {
        lo = Math.min(i0, i1) + 1
        hi = Math.max(i0, i1)
        backward = i0 > i1
        from = i0
        to = i1
      }
    }
    const axis: WalkAxis | undefined =
      overlaps || length === 0
        ? undefined
        : axisStart !== undefined
          ? { contig: path.contig, start: axisStart, reversed: backward }
          : from < 0
            ? { contig: path.contig, start: stepStart[0]!, reversed: false }
            : from < to
              ? { contig: path.contig, start: stepEnd(from), reversed: false }
              : { contig: path.contig, start: stepStart[from]!, reversed: true }

    let bp = 0
    let offReferenceBp = 0
    let gapBp = 0
    let step = 0
    let lastAt = -1
    let lastFlags = 0
    let lastRef = Number.NaN
    for (let k = lo; k < hi; k++) {
      const id = steps[backward ? hi - 1 - (k - lo) : k]!
      if (id < 0) {
        out.push(bp, -id, RUN_GAP, Number.NaN)
        lastAt = out.length - 1
        lastFlags = RUN_GAP
        lastRef = Number.NaN
        bp += -id
        gapBp += -id
        step = 0
        continue
      }
      const len = lengthOf(id)
      const sStart = spanStart[id]!
      const onRef = !Number.isNaN(sStart)
      const at = lastRef
      const hasAt = lastAt >= 0 && !Number.isNaN(at)
      const forward =
        onRef && hasAt && step >= 0 && at + (out.bp[lastAt] ?? 0) === sStart
      const back = onRef && hasAt && step <= 0 && spanEnd[id] === at
      if (
        !onRef &&
        lastAt >= 0 &&
        !(lastFlags & RUN_ON_REFERENCE) &&
        !(lastFlags & RUN_GAP)
      ) {
        out.bp[lastAt]! += len
      } else if (forward || back) {
        out.bp[lastAt]! += len
        if (!forward) {
          lastRef = sStart
          out.referenceStart[lastAt] = sStart
          lastFlags |= RUN_REVERSED
          out.flags[lastAt] = lastFlags
        }
        step = forward ? 1 : -1
      } else {
        lastFlags = onRef ? RUN_ON_REFERENCE : 0
        lastRef = onRef ? sStart : Number.NaN
        out.push(bp, len, lastFlags, lastRef)
        lastAt = out.length - 1
        step = 0
      }
      bp += len
      if (!onRef) {
        offReferenceBp += len
      }
    }
    out.endRow()
    return {
      name: path.name,
      label: `${path.sample}#${path.haplotype}`,
      sample: path.sample,
      haplotype: path.haplotype,
      bp,
      offReferenceBp,
      gapBp,
      complete,
      axis,
    }
  }

  const reference = rowOf([first])
  const rowList = [...walks.values()].map(pieces => ({
    meta: rowOf(pieces),
    row: out.offsets.length - 2,
  }))
  rowList.sort(
    (a, b) =>
      Number(b.meta.complete) - Number(a.meta.complete) ||
      b.meta.bp - a.meta.bp ||
      a.meta.label.localeCompare(b.meta.label),
  )
  // rows in drawn order: the reference, then the sorted walks
  const order = [0, ...rowList.map(r => r.row)]
  const total = out.length
  const offsets = new Uint32Array(order.length + 1)
  const start = new Float64Array(total)
  const bpOut = new Float64Array(total)
  const referenceStart = new Float64Array(total)
  const flags = new Uint8Array(total)
  let at = 0
  order.forEach((row, i) => {
    const a = out.offsets[row]!
    const b = out.offsets[row + 1]!
    for (let k = a; k < b; k++, at++) {
      start[at] = out.start[k]!
      bpOut[at] = out.bp[k]!
      referenceStart[at] = out.referenceStart[k]!
      flags[at] = out.flags[k]!
    }
    offsets[i + 1] = at
  })
  return {
    origin: cut ? cut.start : first.start,
    rows: [reference, ...rowList.map(r => r.meta)],
    offsets,
    start,
    bp: bpOut,
    referenceStart,
    flags,
  }
}

function runAt(t: WalkRowRuns, k: number): WalkRun {
  const f = t.flags[k]!
  const run: WalkRun = {
    start: t.start[k]!,
    bp: t.bp[k]!,
    onReference: (f & RUN_ON_REFERENCE) !== 0,
  }
  if (f & RUN_GAP) {
    run.gap = true
  } else {
    run.referenceStart = Number.isNaN(t.referenceStart[k]!)
      ? undefined
      : t.referenceStart[k]
  }
  if (f & RUN_REVERSED) {
    run.reversed = true
  }
  return run
}

/** The rows as bandage-core's `WalkRows`, a run object per run */
export function walkRowsOf(t: WalkRowRuns, unit?: number): WalkRows {
  const rows = t.rows.map((meta, i) => {
    const runs: WalkRun[] = []
    for (let k = t.offsets[i]!; k < t.offsets[i + 1]!; k++) {
      runs.push(runAt(t, k))
    }
    return { ...meta, runs }
  })
  return { origin: t.origin, unit, reference: rows[0]!, rows: rows.slice(1) }
}
