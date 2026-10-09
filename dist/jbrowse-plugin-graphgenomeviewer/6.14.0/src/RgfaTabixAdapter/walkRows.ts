import { NodeLimitError } from '@jbrowse/bandage-core/gbzWindow'
import { panSNMatchesPrefix } from '@jbrowse/bandage-core/pansn'
import { getBpDisplayStr } from '@jbrowse/core/util'

import type { GraphTables } from '@jbrowse/bandage-core/gfa/graphTables'

// A walk-indexed graph is three tabix files filed under fixed chunks of each
// reference: walk rows, node rows and link rows. A row's first three columns
// name its chunk, either as the whole chunk or as its first base.
//
//   walks: anchor cs ce sample#hap#contig fragStart hapOffset piece nsteps steps
//   nodes: anchor cs ce id rank stableName start end [tags]
//   links: anchor cs ce src+ tgt- [both endpoints' coordinates]
//
// Steps are node-id deltas with the orientation in the low bit,
// comma-separated, the first of each row absolute. A haplotype path's piece in
// one chunk is cut into rows of at most a fixed number of steps, and each row
// takes the next piece index, so consecutive indices of one path join. From
// gfa-to-tabix 0.6.0 a row ends with `pv:i:` and `nx:i:`, the start of the
// chunk its path's piece before and after it is filed under (`pv:Z:seq:start`
// on another reference sequence), with no tag at either end of the path.
export interface WalkRow {
  name: string
  fragStart: number
  hapOffset: number
  piece: number
  n: number
  enc: string
  chunkStart: number
  prev?: WalkChunk
  next?: WalkChunk
}

export interface WalkChunk {
  refName: string
  start: number
}

export interface WalkNode {
  refName: string
  start: number
  end: number
  rank: number
  // on the reference inside the window plus the cut's context
  onWindow: boolean
}

export interface WalkWindow {
  refName: string
  start: number
  end: number
  context: number
}

// The name column, read without splitting the steps, so a row the cut does
// not want costs a few indexOf calls
export function walkRowName(line: string) {
  let at = -1
  for (let k = 0; k < 3; k++) {
    at = line.indexOf('\t', at + 1)
  }
  return line.slice(at + 1, line.indexOf('\t', at + 1))
}

export function parseWalkRow(line: string): WalkRow {
  const c = line.split('\t')
  const row: WalkRow = {
    chunkStart: +c[1]!,
    name: c[3]!,
    fragStart: +c[4]!,
    hapOffset: +c[5]!,
    piece: +c[6]!,
    n: +c[7]!,
    enc: c[8]!,
  }
  for (let k = 9; k < c.length; k++) {
    const tag = c[k]!
    const side = tag.startsWith('pv:')
      ? 'prev'
      : tag.startsWith('nx:')
        ? 'next'
        : undefined
    if (side) {
      const at = tag.lastIndexOf(':')
      row[side] = {
        refName: tag[3] === 'Z' ? tag.slice(5, at) : c[0]!,
        start: +tag.slice(at + 1),
      }
    }
  }
  return row
}

export interface WalkHeader {
  chunk?: number
  maxNode?: number
  references: string[]
  haplotypes: string[]
}

function integerTag(line: string, tag: string) {
  const match = new RegExp(`(?:^|\\t)${tag}:i:(\\d+)`).exec(line)
  return match ? +match[1]! : undefined
}

/**
 * What a walk file's header states: its chunk size in a
 * `#walks\tchunk:i:65536` line, from gfa-to-tabix 0.4.0 a
 * `#reference\tGRCh38` line per reference sample and a
 * `#haplotype\tHG002#1` line per other haplotype with rows, and from 0.5.0
 * the longest node in bp as `maxnode:i:1024` beside the chunk size
 */
export function walkHeader(lines: string[]): WalkHeader {
  const header: WalkHeader = { references: [], haplotypes: [] }
  for (const line of lines) {
    const [key, value = ''] = line.split('\t')
    if (key === '#reference') {
      header.references.push(value)
    } else if (key === '#haplotype') {
      header.haplotypes.push(value)
    } else {
      header.chunk ??= integerTag(line, 'chunk')
      header.maxNode ??= integerTag(line, 'maxnode')
    }
  }
  return header
}

/**
 * How many chunks before the window's own a cut reads. A node is filed under
 * the chunk holding its start, so a node `maxNode` bp long reaching into the
 * window starts at most ceil(maxNode / chunk) chunks back. At least one, since
 * the chunk before carries the detour a haplotype takes into the window's
 * first reference node; one when the header gives no `maxnode:i:`, which holds
 * for vg's graphs, chopped to nodes of at most 1,024 bp.
 */
export function lookbackChunks(maxNode: number | undefined, chunk: number) {
  return maxNode === undefined ? 1 : Math.max(1, Math.ceil(maxNode / chunk))
}

// The first base a cut queries: the start of the chunk `lookback` chunks
// before the one holding the window's start
export function chunkQueryStart(start: number, chunk: number, lookback = 1) {
  return Math.max(0, (Math.floor(start / chunk) - lookback) * chunk)
}

// Which walks a cut decodes: the reference's, and those `wanted` names by
// PanSN prefix at sample or haplotype depth; undefined decodes every one
export function walkNameFilter(
  wanted: string[] | undefined,
  referenceHaplotype: string | undefined,
) {
  return wanted === undefined || wanted.length === 0
    ? undefined
    : (name: string) =>
        panSNMatchesPrefix(name, referenceHaplotype) ||
        wanted.some(prefix => panSNMatchesPrefix(name, prefix))
}

export function decodeSteps(
  enc: string,
  n: number,
  ids = new Int32Array(n),
  rev = new Uint8Array(n),
  at = 0,
) {
  let prev = 0
  let i = at
  let v = 0
  let neg = false
  for (let p = 0; p <= enc.length; p++) {
    const ch = p < enc.length ? enc.charCodeAt(p) : 44
    if (ch === 44) {
      const d = neg ? -v : v
      const r = d & 1
      rev[i] = r
      prev += (d - r) / 2
      ids[i++] = prev
      v = 0
      neg = false
    } else if (ch === 45) {
      neg = true
    } else {
      v = v * 10 + (ch - 48)
    }
  }
  return { ids, rev }
}

// One stretch of a haplotype path: rows of consecutive piece index, decoded,
// and where the path goes on before and after it, when the rows say
export interface WalkRun {
  name: string
  hapOffset: number
  ids: Int32Array
  rev: Uint8Array
  prev?: WalkChunk
  next?: WalkChunk
}

export function joinPieces(rows: WalkRow[]) {
  const byPath = new Map<string, WalkRow[]>()
  for (const row of rows) {
    const key = `${row.name}\t${row.fragStart}`
    const list = byPath.get(key)
    if (list) {
      list.push(row)
    } else {
      byPath.set(key, [row])
    }
  }
  const runs: WalkRun[] = []
  for (const pieces of byPath.values()) {
    pieces.sort((a, b) => a.piece - b.piece)
    let from = 0
    for (let i = 1; i <= pieces.length; i++) {
      if (
        i === pieces.length ||
        pieces[i]!.piece !== pieces[i - 1]!.piece + 1
      ) {
        runs.push(decodeRun(pieces.slice(from, i)))
        from = i
      }
    }
  }
  return runs
}

function decodeRun(pieces: WalkRow[]): WalkRun {
  const n = pieces.reduce((sum, p) => sum + p.n, 0)
  const ids = new Int32Array(n)
  const rev = new Uint8Array(n)
  let at = 0
  for (const p of pieces) {
    decodeSteps(p.enc, p.n, ids, rev, at)
    at += p.n
  }
  const first = pieces[0]!
  return {
    name: first.name,
    hapOffset: first.hapOffset,
    ids,
    rev,
    prev: first.prev,
    next: pieces.at(-1)!.next,
  }
}

export interface WalkFragment {
  name: string
  hapStart: number
  hapEnd: number
  ids: Int32Array
  rev: Uint8Array
}

/**
 * The cut a window draws from its walks: the reference inside the window plus
 * its context, and each run from its first to its last step on that stretch.
 * A run that leaves the reference there, through steps off it or across a
 * deletion, is followed to the reference step where it rejoins, when the read
 * holds it, and otherwise through the steps off the reference it holds: at
 * the ABCA7 VNTR four haplotypes leave inside the repeat and rejoin 1.8 kb
 * past the window, and cut at the context they measured as partial walks. The reference is cut out as far as those rejoins reach, and
 * a run then runs on outward while the next step's node is already in the
 * cut. Without the run-on a haplotype whose alternate allele straddles the
 * edge stopped short of a node other walks had brought into the cut, and that
 * node drew without it. The run-on adds no node, so one pass is enough.
 */
export function walkCut(
  runs: WalkRun[],
  nodes: Map<number, WalkNode>,
  refName: string,
) {
  const onWindow = (id: number) => nodes.get(id)?.onWindow === true
  const reference = (id: number) => {
    const node = nodes.get(id)
    return node?.rank === 0 ? node : undefined
  }
  // the chunks walks cut off at the end of a run go on in
  const open = new Map<string, WalkChunk>()
  const goesOn = (chunk: WalkChunk | undefined) => {
    if (chunk) {
      open.set(`${chunk.refName}:${chunk.start}`, chunk)
    }
  }
  // Where a walk stops being followed from step `at`, going by `dir`: the
  // reference step it rejoins at past any steps off the reference, or across
  // a deletion; else its last step off the reference before the run ends,
  // noting the chunk the path goes on in, or reaches another reference
  // sequence
  const rejoin = (run: WalkRun, at: number, dir: number) => {
    const { ids } = run
    let i = at + dir
    while (i >= 0 && i < ids.length && reference(ids[i]!) === undefined) {
      i += dir
    }
    if (i < 0 || i >= ids.length) {
      goesOn(dir < 0 ? run.prev : run.next)
      return i - dir
    }
    const from = reference(ids[at]!)!
    const to = reference(ids[i]!)!
    if (to.refName !== refName) {
      return i - dir
    }
    const adjacent =
      i === at + dir && (to.start === from.end || to.end === from.start)
    return adjacent ? at : i
  }
  let reachStart = Infinity
  let reachEnd = -Infinity
  const spans: { run: WalkRun; first: number; last: number }[] = []
  for (const run of runs) {
    const { ids } = run
    let first = -1
    let last = -1
    for (let i = 0; i < ids.length; i++) {
      if (onWindow(ids[i]!)) {
        if (first < 0) {
          first = i
        }
        last = i
      }
    }
    if (first >= 0) {
      if (run.name !== refName) {
        first = rejoin(run, first, -1)
        last = rejoin(run, last, 1)
        for (const i of [first, last]) {
          const node = reference(ids[i]!)
          if (node) {
            reachStart = Math.min(reachStart, node.start)
            reachEnd = Math.max(reachEnd, node.end)
          }
        }
      }
      spans.push({ run, first, last })
    }
  }
  const inReach = (id: number) => {
    const node = reference(id)
    return (
      onWindow(id) ||
      (node?.refName === refName &&
        node.end > reachStart &&
        node.start < reachEnd)
    )
  }
  const kept = new Set<number>()
  for (const [id, node] of nodes) {
    if (node.onWindow) {
      kept.add(id)
    }
  }
  for (const span of spans) {
    const { ids } = span.run
    if (span.run.name === refName) {
      while (span.first > 0 && inReach(ids[span.first - 1]!)) {
        span.first--
      }
      while (span.last < ids.length - 1 && inReach(ids[span.last + 1]!)) {
        span.last++
      }
    }
    for (let i = span.first; i <= span.last; i++) {
      kept.add(ids[i]!)
    }
  }
  const length = (id: number) => {
    const node = nodes.get(id)
    return node === undefined ? 0 : node.end - node.start
  }
  const fragments: WalkFragment[] = []
  for (const { run, first: f, last: l } of spans) {
    const { ids, rev } = run
    let first = f
    let last = l
    while (first > 0 && kept.has(ids[first - 1]!)) {
      first--
    }
    while (last < ids.length - 1 && kept.has(ids[last + 1]!)) {
      last++
    }
    let hapStart = run.hapOffset
    for (let i = 0; i < first; i++) {
      hapStart += length(ids[i]!)
    }
    let hapEnd = hapStart
    for (let i = first; i <= last; i++) {
      hapEnd += length(ids[i]!)
    }
    fragments.push({
      name: run.name,
      hapStart,
      hapEnd,
      ids: ids.subarray(first, last + 1),
      rev: rev.subarray(first, last + 1),
    })
  }
  return { kept, fragments, open: [...open.values()] }
}

// The positions of a line's first `n` tabs, -1 past the last
function tabs(line: string, n: number, out: number[]) {
  let at = -1
  for (let k = 0; k < n; k++) {
    at = at === -1 && k > 0 ? -1 : line.indexOf('\t', at + 1)
    out[k] = at
  }
  return out
}

/**
 * The node and link rows a walk cut reads, parsed as they arrive, and the
 * tables of the cut they make with its walks. A node filed under two chunks
 * arrives twice and is read once; columns past a node row's eighth (LN:i:,
 * SQ:Z: and whatever follows) are not read at all.
 */
export class WalkGraph {
  readonly nodes = new Map<number, WalkNode>()
  private links: number[] = []
  private readonly t: number[] = []

  constructor(private window: WalkWindow) {}

  addNode(line: string) {
    const t = tabs(line, 8, this.t)
    const id = +line.slice(t[2]! + 1, t[3])
    if (!this.nodes.has(id)) {
      const rank = +line.slice(t[3]! + 1, t[4])
      const refName = line.slice(t[4]! + 1, t[5])
      const start = +line.slice(t[5]! + 1, t[6])
      const end = +line.slice(t[6]! + 1, t[7] === -1 ? undefined : t[7])
      const { window } = this
      this.nodes.set(id, {
        rank,
        refName,
        start,
        end,
        onWindow:
          rank === 0 &&
          refName === window.refName &&
          end > window.start - window.context &&
          start < window.end + window.context,
      })
    }
  }

  // An endpoint is held as id * 2 + 1 when reversed
  addLink(line: string) {
    const t = tabs(line, 5, this.t)
    this.links.push(
      endpoint(line, t[2]! + 1, t[3]!),
      endpoint(line, t[3]! + 1, t[4] === -1 ? line.length : t[4]!),
    )
  }

  /**
   * The cut as typed arrays, which the worker transfers rather than copies:
   * nodes by reference position, each link once in the order its L line
   * sorts, then a walk per fragment, the reference's first and the rest by
   * name. graphTablesGFA writes them as the GFA they stand for, the same bytes
   * for the same rows.
   */
  tables(kept: Set<number>, fragments: WalkFragment[]): GraphTables {
    const held: (WalkNode & { id: number })[] = []
    for (const id of kept) {
      const node = this.nodes.get(id)
      if (node) {
        held.push({ ...node, id })
      }
    }
    held.sort((x, y) =>
      x.refName < y.refName
        ? -1
        : x.refName > y.refName
          ? 1
          : x.start - y.start || x.id - y.id,
    )
    const index = new Map<number, number>()
    const names: string[] = []
    const refNames: string[] = []
    const refIndex = new Map<string, number>()
    const lengths = new Int32Array(held.length)
    const refs = new Int32Array(held.length)
    const starts = new Float64Array(held.length)
    const ranks = new Int32Array(held.length)
    held.forEach(({ id, refName, start, end, rank }, i) => {
      index.set(id, i)
      names.push(String(id))
      let ref = refIndex.get(refName)
      if (ref === undefined) {
        ref = refNames.length
        refIndex.set(refName, ref)
        refNames.push(refName)
      }
      lengths[i] = end - start
      refs[i] = ref
      starts[i] = start
      ranks[i] = rank
    })
    // a kept node with no row of its own is named, and not drawn
    const nodeIndex = (id: number) => {
      let i = index.get(id)
      if (i === undefined) {
        i = names.length
        index.set(id, i)
        names.push(String(id))
      }
      return i
    }

    const byLine = new Map<string, number>()
    for (let i = 0; i < this.links.length; i += 2) {
      const a = this.links[i]!
      const b = this.links[i + 1]!
      const source = Math.floor(a / 2)
      const target = Math.floor(b / 2)
      if (kept.has(source) && kept.has(target)) {
        byLine.set(
          `${source}\t${a % 2 ? '-' : '+'}\t${target}\t${b % 2 ? '-' : '+'}`,
          i,
        )
      }
    }
    const lines = [...byLine.keys()].sort()
    const from = new Int32Array(lines.length)
    const to = new Int32Array(lines.length)
    const strands = new Uint8Array(lines.length)
    lines.forEach((line, k) => {
      const i = byLine.get(line)!
      const a = this.links[i]!
      const b = this.links[i + 1]!
      from[k] = nodeIndex(Math.floor(a / 2))
      to[k] = nodeIndex(Math.floor(b / 2))
      strands[k] = (a % 2) | ((b % 2) << 1)
    })

    const walks = this.referenceFirst(fragments)
    const offsets = new Int32Array(walks.length + 1)
    walks.forEach(({ ids }, p) => {
      offsets[p + 1] = offsets[p]! + ids.length
    })
    const steps = new Int32Array(offsets[walks.length]!)
    const reversed = new Uint8Array(steps.length)
    walks.forEach(({ ids, rev }, p) => {
      const at = offsets[p]!
      for (let j = 0; j < ids.length; j++) {
        steps[at + j] = nodeIndex(ids[j]!)
      }
      reversed.set(rev, at)
    })
    return {
      nodes: { names, lengths, refs, starts, ranks, refNames },
      links: { from, to, strands },
      walks: {
        names: walks.map(f => f.name),
        starts: Float64Array.from(walks, f => f.hapStart),
        ends: Float64Array.from(walks, f => f.hapEnd),
        offsets,
        steps,
        reversed,
      },
    }
  }

  // The view anchors on the first walk when no walk names the assembly, as
  // gbz-base's cut has it; in file order that was whichever haplotype the
  // chunk listed first, CHM13 on a GRCh38 window
  private referenceFirst(fragments: WalkFragment[]) {
    const { refName } = this.window
    return [...fragments].sort(
      (a, b) =>
        Number(b.name === refName) - Number(a.name === refName) ||
        (a.name < b.name ? -1 : a.name > b.name ? 1 : a.hapStart - b.hapStart),
    )
  }
}

function endpoint(line: string, from: number, to: number) {
  return (
    +line.slice(from, to - 1) * 2 + (line.charCodeAt(to - 1) === 45 ? 1 : 0)
  )
}

/**
 * The zoom-in notice for a cut whose walk rows hold more steps than `budget`,
 * or undefined when they fit. A window reads whole chunks, those before it
 * included, so the span that fits is counted in chunks from the window's
 * start; when the chunks a window there always reads are over on their own,
 * no zoom fits and the notice asks for fewer haplotypes. A cut for every
 * haplotype is also offered fewer where the reference and one haplotype, at
 * the walks' average steps, would fit the whole window.
 */
export function stepBudgetError(
  rows: WalkRow[],
  budget: number,
  window: { start: number; end: number },
  chunk: number,
  filtered: boolean,
) {
  let total = 0
  const perChunk = new Map<number, number>()
  const walks = new Set<string>()
  for (const row of rows) {
    total += row.n
    perChunk.set(row.chunkStart, (perChunk.get(row.chunkStart) ?? 0) + row.n)
    walks.add(row.name)
  }
  if (total <= budget) {
    return undefined
  }
  const windowBp = window.end - window.start
  let read = 0
  let fitsBp = 0
  for (const cs of [...perChunk.keys()].sort((a, b) => a - b)) {
    read += perChunk.get(cs)!
    if (read > budget) {
      break
    }
    fitsBp = Math.max(fitsBp, cs + chunk - window.start)
  }
  const fewerFit =
    !filtered && walks.size > 2 && (2 * total) / walks.size <= budget
  const error = new NodeLimitError(budget, windowBp, Math.max(fitsBp, 1))
  error.message =
    fitsBp > 0
      ? `Zoom in to about ${getBpDisplayStr(fitsBp)}${fewerFit ? ', or choose fewer haplotypes,' : ''} to see the graph`
      : `Too many haplotype steps here to draw ${filtered ? 'these haplotypes' : 'every haplotype'} (${read.toLocaleString()} against walkStepBudget ${budget.toLocaleString()}); choose fewer haplotypes`
  return error
}

/**
 * The zoom-in notice for a cut that keeps more steps than `budget`, or
 * undefined when it fits. The span that fits is the window scaled by how far
 * over the cut is.
 */
export function keptStepsError(
  fragments: WalkFragment[],
  budget: number,
  window: { start: number; end: number },
  filtered: boolean,
) {
  const total = fragments.reduce((sum, f) => sum + f.ids.length, 0)
  if (total <= budget) {
    return undefined
  }
  const windowBp = window.end - window.start
  const fitsBp = Math.max(1, Math.floor((windowBp * budget) / total))
  const error = new NodeLimitError(budget, windowBp, fitsBp)
  error.message = `Zoom in to about ${getBpDisplayStr(fitsBp)}${filtered ? '' : ', or choose fewer haplotypes,'} to see the graph`
  return error
}

/**
 * The zoom-in notice for a cut whose three files would fetch more than
 * `budget` compressed bytes, or undefined when they fit. `bytesTo(end)` is the
 * indexes' estimate for a read from the window's first query base to `end`;
 * the span that fits grows a chunk at a time from the chunk holding the
 * window's start, and when that chunk and those before it are over on their
 * own, no zoom fits.
 */
export async function byteBudgetError(
  bytesTo: (end: number) => Promise<number>,
  budget: number,
  window: { start: number; end: number },
  chunk: number,
) {
  const bytes = await bytesTo(window.end)
  if (bytes <= budget) {
    return undefined
  }
  let fitsBp = 0
  let least: number | undefined
  for (
    let cs = Math.floor(window.start / chunk) * chunk;
    cs < window.end;
    cs += chunk
  ) {
    const read = await bytesTo(cs + 1)
    least ??= read
    if (read > budget) {
      break
    }
    fitsBp = cs + chunk - window.start
  }
  const windowBp = window.end - window.start
  const error = new NodeLimitError(budget, windowBp, Math.max(fitsBp, 1))
  error.message =
    fitsBp > 0
      ? `Zoom in to about ${getBpDisplayStr(fitsBp)} to see the graph`
      : `Too much graph here to fetch (${megabytes(least ?? bytes)} against walkByteBudget ${megabytes(budget)})`
  return error
}

const megabytes = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`
