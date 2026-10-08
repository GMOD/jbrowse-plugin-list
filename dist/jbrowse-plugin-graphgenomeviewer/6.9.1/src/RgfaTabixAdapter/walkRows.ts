import { NodeLimitError } from '@jbrowse/bandage-core/gbzWindow'
import { panSNMatchesPrefix } from '@jbrowse/bandage-core/pansn'
import { getBpDisplayStr } from '@jbrowse/core/util'

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
// takes the next piece index, so consecutive indices of one path join.
export interface WalkRow {
  name: string
  fragStart: number
  hapOffset: number
  piece: number
  n: number
  enc: string
  chunkStart: number
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
  const c = line.split('\t', 9)
  return {
    chunkStart: +c[1]!,
    name: c[3]!,
    fragStart: +c[4]!,
    hapOffset: +c[5]!,
    piece: +c[6]!,
    n: +c[7]!,
    enc: c[8]!,
  }
}

export interface WalkHeader {
  chunk?: number
  references: string[]
  haplotypes: string[]
}

/**
 * What a walk file's header states: its chunk size in a
 * `#walks\tchunk:i:65536` line, and from gfa-to-tabix 0.4.0 a
 * `#reference\tGRCh38` line per reference sample and a
 * `#haplotype\tHG002#1` line per other haplotype with rows
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
      const match = /(?:^|\t)chunk:i:(\d+)/.exec(line)
      if (match && header.chunk === undefined) {
        header.chunk = +match[1]!
      }
    }
  }
  return header
}

// The first base a cut queries: the start of the chunk holding the base one
// chunk before the window, whose rows carry the detour a haplotype takes into
// the window's first reference node
export function chunkQueryStart(start: number, chunk: number) {
  return Math.max(0, Math.floor((start - chunk) / chunk) * chunk)
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

// One stretch of a haplotype path: rows of consecutive piece index, decoded
export interface WalkRun {
  name: string
  hapOffset: number
  ids: Int32Array
  rev: Uint8Array
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
  return { name: pieces[0]!.name, hapOffset: pieces[0]!.hapOffset, ids, rev }
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
 * its context, and each run from its first to its last step on that stretch,
 * run on outward while the next step's node is already in the cut. Without
 * the run-on a haplotype whose alternate allele straddles the edge stopped
 * short of a node other walks had brought into the cut, and that node drew
 * without it. The run-on adds no node, so one pass is enough.
 */
export function walkCut(runs: WalkRun[], nodes: Map<number, WalkNode>) {
  const onWindow = (node: WalkNode | undefined) => node?.onWindow === true
  const kept = new Set<number>()
  for (const [id, node] of nodes) {
    if (node.onWindow) {
      kept.add(id)
    }
  }
  const spans: { run: WalkRun; first: number; last: number }[] = []
  for (const run of runs) {
    const { ids } = run
    let first = -1
    let last = -1
    for (let i = 0; i < ids.length; i++) {
      if (onWindow(nodes.get(ids[i]!))) {
        if (first < 0) {
          first = i
        }
        last = i
      }
    }
    if (first >= 0) {
      for (let i = first; i <= last; i++) {
        kept.add(ids[i]!)
      }
      spans.push({ run, first, last })
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
  return { kept, fragments }
}

export function formatWalk({ name, hapStart, hapEnd, ids, rev }: WalkFragment) {
  const [sample, haplotype, ...contig] = name.split('#')
  const steps = new Array<string>(ids.length)
  for (let i = 0; i < ids.length; i++) {
    steps[i] = (rev[i] ? '<' : '>') + ids[i]
  }
  return `W\t${sample}\t${haplotype}\t${contig.join('#')}\t${hapStart}\t${hapEnd}\t${steps.join('')}`
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
 * The node and link rows a walk cut reads, parsed as they arrive, and the GFA
 * text of the cut they make with its walks. A node filed under two chunks
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
   * GFA text: S lines by reference position, then L lines, then a W line per
   * fragment, the reference's first and the rest by name, the same bytes for
   * the same rows
   */
  format(kept: Set<number>, fragments: WalkFragment[]) {
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
    const lines = ['H\tVN:Z:1.1']
    for (const { id, refName, start, end, rank } of held) {
      lines.push(
        `S\t${id}\t*\tLN:i:${end - start}\tSN:Z:${refName}\tSO:i:${start}\tSR:i:${rank}`,
      )
    }
    const seen = new Set<string>()
    const links: string[] = []
    for (let i = 0; i < this.links.length; i += 2) {
      const a = this.links[i]!
      const b = this.links[i + 1]!
      const source = Math.floor(a / 2)
      const target = Math.floor(b / 2)
      if (kept.has(source) && kept.has(target)) {
        const line = `L\t${source}\t${a % 2 ? '-' : '+'}\t${target}\t${b % 2 ? '-' : '+'}\t0M`
        if (!seen.has(line)) {
          seen.add(line)
          links.push(line)
        }
      }
    }
    links.sort()
    return [
      ...lines,
      ...links,
      ...this.referenceFirst(fragments).map(formatWalk),
    ].join('\n')
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
 * or undefined when they fit. A window reads whole chunks, the one before it
 * included, so the span that fits is counted in chunks from the window's
 * start; when the two chunks a window there always reads are over on their
 * own, no zoom fits and the notice asks for fewer haplotypes. A cut for every
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
 * The zoom-in notice for a cut whose three files would fetch more than
 * `budget` compressed bytes, or undefined when they fit. `bytesTo(end)` is the
 * indexes' estimate for a read from the window's first query base to `end`;
 * the span that fits grows a chunk at a time from the chunk holding the
 * window's start, and when that chunk and the one before are over on their
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
