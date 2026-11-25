/**
 * Reads carrying the same insertion event usually differ slightly inside it
 * (sequencing error, or a real indel within the inserted allele). Laying each
 * one out left-justified puts those differences in different columns and the
 * shared event stops being readable. Aligning the inserted sequences against
 * each other fixes that.
 *
 * There are two ways to do it, and which one applies is a property of the
 * inserted sequence rather than a setting:
 *
 * - **Aperiodic** (`alignInsertionSite`): one center-star alignment over the
 *   whole inserted sequence. Right for a novel insertion, a mobile element, anything
 *   whose bases only make sense read straight through.
 * - **Periodic** (`alignPeriodicInsertions`): a tandem array, where the whole
 *   inserted sequence is n copies of one unit. Aligning those base-to-base is
 *   both unaffordable and wrong — it is free to align copy 5 of one read to
 *   copy 3 of another, and the difference that matters (how many copies) ends
 *   up expressed as where the row stops. Aligning unit-to-unit instead puts
 *   copy k of every read in the same columns, so copy number reads as a count
 *   of blocks and a divergent copy stands out as a column inside its block.
 *
 * Both are local to one reference position: the insertion still occupies "as
 * many columns as the widest gapped sequence", which is the only thing
 * buildColumnToRefPos knows about, so the column <-> reference mapping is
 * untouched either way.
 */

import { MAX_PERIOD, MIN_COPIES, MIN_PERIOD } from './repeats'

const MATCH = 2
const MISMATCH = -2
const GAP = -3

// Fraction of positions that must agree at lag p for p to be the period. Loose
// enough for the ~5-15% divergence between copies of a real VNTR unit and for
// long-read error on top of it.
const PERIODIC_MATCH = 0.8

// The period scan is O(len * maxPeriod), so it runs on a prefix rather than the
// whole insert. An array that is periodic in its first 3kb is periodic.
const PROBE_LEN = 3000

// Backstops on the work done at one insertion site: decline and leave the site
// left-justified rather than stall on it.
const MAX_UNITS = 1000
const MAX_SITE_CELLS = 20_000_000

const INITIAL_BAND = 8

const UNREACHABLE = -(2 ** 30)
const DIAGONAL = 1
const UP = 2
const LEFT = 4

/**
 * Global alignment of `a` against `b` over the diagonals `lo..hi` (j - i) of
 * the dynamic programming matrix, keeping every move that reaches each cell's
 * best score. With `lo = -a.length` and `hi = b.length` it is the full matrix.
 */
function fillBand(a: string, b: string, lo: number, hi: number) {
  const n = a.length
  const m = b.length
  const width = hi - lo + 1
  const codesB = Uint16Array.from(b, c => c.charCodeAt(0))
  const moves = new Uint8Array((n + 1) * width)
  let previous = new Int32Array(width + 1).fill(UNREACHABLE)
  let current = new Int32Array(width + 1).fill(UNREACHABLE)
  for (let j = 0; j <= Math.min(m, hi); j++) {
    previous[j - lo] = j * GAP
    moves[j - lo] = LEFT
  }
  for (let i = 1; i <= n; i++) {
    current.fill(UNREACHABLE)
    const row = i * width
    const codeA = a.charCodeAt(i - 1)
    const first = Math.max(0, i + lo)
    const last = Math.min(m, i + hi)
    if (first === 0) {
      current[-i - lo] = i * GAP
      moves[row - i - lo] = UP
    }
    for (let j = Math.max(1, first); j <= last; j++) {
      const k = j - i - lo
      const diagonal =
        previous[k]! + (codeA === codesB[j - 1] ? MATCH : MISMATCH)
      const up = previous[k + 1]! + GAP
      const left = k > 0 ? current[k - 1]! + GAP : UNREACHABLE
      const best =
        diagonal >= up
          ? diagonal >= left
            ? diagonal
            : left
          : up >= left
            ? up
            : left
      current[k] = best
      moves[row + k] =
        (diagonal === best ? DIAGONAL : 0) |
        (up === best ? UP : 0) |
        (left === best ? LEFT : 0)
    }
    ;[previous, current] = [current, previous]
  }
  return { lo, width, moves, lastRow: previous }
}

type Band = ReturnType<typeof fillBand>

/**
 * The alignment ending at cell (i, j), preferring a diagonal step, then a gap
 * in `b`, then a gap in `a`, so equally-scoring alignments resolve the same way
 * at every site.
 */
function traceBand(a: string, b: string, band: Band, i: number, j: number) {
  const outA: string[] = []
  const outB: string[] = []
  let x = i
  let y = j
  while (x > 0 || y > 0) {
    const move = band.moves[x * band.width + y - x - band.lo]!
    if (move & DIAGONAL) {
      outA.push(a[x - 1]!)
      outB.push(b[y - 1]!)
      x--
      y--
    } else if (move & UP) {
      outA.push(a[x - 1]!)
      outB.push('-')
      x--
    } else {
      outA.push('-')
      outB.push(b[y - 1]!)
      y--
    }
  }
  return {
    center: outA.reverse().join(''),
    other: outB.reverse().join(''),
  }
}

/** the best score an alignment of `length` bases in all, `gaps` of them gapped, can reach */
function scoreCeiling(length: number, gaps: number) {
  return (MATCH * (length - gaps)) / 2 + GAP * gaps
}

/** cells of the dynamic programming matrix a site may still fill */
interface Budget {
  cells: number
}

/**
 * One banded fill, `slack` diagonals either side of the ones joining the two
 * corners, charged to `budget`. `proven` says no alignment leaving the band can
 * score as well as the best one inside it, so the band's alignment is the
 * global one, traceback included.
 */
function fillWithin(a: string, b: string, slack: number, budget: Budget) {
  const n = a.length
  const m = b.length
  const lo = Math.max(-n, Math.min(0, m - n) - slack)
  const hi = Math.min(m, Math.max(0, m - n) + slack)
  budget.cells -= (n + 1) * (hi - lo + 1)
  const gapsThrough = (diagonal: number) =>
    Math.abs(diagonal) + Math.abs(m - n - diagonal)
  const outside = Math.min(
    lo > -n ? gapsThrough(lo - 1) : Infinity,
    hi < m ? gapsThrough(hi + 1) : Infinity,
  )
  const band = budget.cells < 0 ? undefined : fillBand(a, b, lo, hi)
  const score = band?.lastRow[m - n - lo]
  return band && score !== undefined
    ? { band, score, proven: score > scoreCeiling(n + m, outside) }
    : undefined
}

/**
 * The slack whose band beats the score cap outside it, given a band that has
 * already scored `score`. A wider band can only score higher, so it stays
 * beaten.
 */
function provingSlack(a: string, b: string, score: number) {
  const gaps =
    (scoreCeiling(a.length + b.length, 0) - score) / (MATCH / 2 - GAP)
  return Math.max(
    INITIAL_BAND + 1,
    Math.floor((gaps - Math.abs(b.length - a.length)) / 2),
  )
}

/**
 * Global alignment in time proportional to length times divergence.
 *
 * A path through diagonal d needs at least |d| + |m - n - d| gaps, which caps
 * its score, so a narrow band whose best score beats the cap on the first
 * diagonal outside it holds the global alignment. When the first fill does not,
 * its score says how wide a band has to be, and the second fill is that wide.
 * Undefined once `budget` is spent.
 */
function alignGlobal(a: string, b: string, budget: Budget) {
  const first = fillWithin(a, b, INITIAL_BAND, budget)
  const settled =
    first && !first.proven
      ? fillWithin(a, b, provingSlack(a, b, first.score), budget)
      : first
  return settled && traceBand(a, b, settled.band, a.length, b.length)
}

/**
 * A pairwise alignment against the center, re-expressed in center coordinates:
 * what the other sequence contributes at each center position, and what it
 * inserts in the gap slot before it. Slot `centerLen` is the trailing overhang.
 */
interface CenterSplit {
  slots: string[]
  /** one char per center position, '-' where the other sequence has nothing */
  atCenter: string
}

function splitAgainstCenter(
  { center, other }: { center: string; other: string },
  centerLen: number,
): CenterSplit {
  const slots = Array.from({ length: centerLen + 1 }, () => '')
  let atCenter = ''
  for (let k = 0; k < center.length; k++) {
    if (center[k] === '-') {
      slots[atCenter.length] = slots[atCenter.length]! + other[k]!
    } else {
      atCenter += other[k]!
    }
  }
  return { slots, atCenter }
}

function emit({ slots, atCenter }: CenterSplit, slotWidths: number[]) {
  let ret = ''
  for (let j = 0; j < atCenter.length; j++) {
    const slot = slots[j]!
    ret += slot + '-'.repeat(slotWidths[j]! - slot.length) + atCenter[j]
  }
  const last = slots[atCenter.length]!
  return ret + last + '-'.repeat(slotWidths[atCenter.length]! - last.length)
}

/**
 * The smallest lag at which a sequence repeats, or undefined when it does not.
 *
 * Scanning up from 1 returns the true minimal period, which is what separates a
 * tandem array from a homopolymer: `AAAA...` matches at every lag and comes back
 * as 1, and a 30bp unit comes back as 30 rather than as 60 or 90.
 */
export function detectPeriod(seq: string): number | undefined {
  const probe = seq.length > PROBE_LEN ? seq.slice(0, PROBE_LEN) : seq
  const maxPeriod = Math.min(MAX_PERIOD, Math.floor(probe.length / MIN_COPIES))
  for (let p = 1; p <= maxPeriod; p++) {
    const n = probe.length - p
    let matches = 0
    for (let i = 0; i < n; i++) {
      if (probe[i] === probe[i + p]) {
        matches++
      }
    }
    if (matches / n >= PERIODIC_MATCH) {
      return p
    }
  }
  return undefined
}

/**
 * Majority base at each offset within the unit, over the whole-length copies of
 * `seq`. The consensus is what every copy of every read is aligned to, so it has
 * to be one fixed string for the site — deriving it per read would let two reads
 * disagree about where a unit starts.
 */
export function consensusUnit(seq: string, period: number) {
  const copies = Math.floor(seq.length / period)
  let ret = ''
  for (let j = 0; j < period; j++) {
    const counts = new Map<string, number>()
    for (let k = 0; k < copies; k++) {
      const c = seq[k * period + j]!
      counts.set(c, (counts.get(c) ?? 0) + 1)
    }
    // ties break lexicographically so the consensus is a function of the input
    // and not of Map iteration order
    ret += [...counts].sort(
      (a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1),
    )[0]![0]
  }
  return ret
}

/**
 * Align one copy of the consensus unit against `seq` starting at `from`: global
 * on the consensus, since a copy is a whole copy, and free at the window's right
 * edge, since the copy ends wherever it ends. `consumed` is where the next copy
 * starts, which is what lets an indel inside one copy stay inside it rather than
 * shifting every copy after it.
 */
function alignUnitAt(consensus: string, seq: string, from: number) {
  const n = consensus.length
  const window = seq.slice(from, from + 2 * n)
  const band = fillBand(consensus, window, -n, window.length)
  // the copy ends at whichever window position scores best once the consensus
  // is spent
  let consumed = 0
  for (let j = 1; j <= window.length; j++) {
    if (band.lastRow[j]! > band.lastRow[consumed]!) {
      consumed = j
    }
  }
  // a copy that consumed nothing would not advance the cursor
  return consumed === 0
    ? undefined
    : { ...traceBand(consensus, window, band, n, consumed), consumed }
}

/** Every copy in `seq`, each as a pairwise alignment against the consensus. */
function splitIntoUnits(seq: string, consensus: string) {
  const units: { center: string; other: string }[] = []
  let cursor = 0
  while (cursor < seq.length) {
    const unit = alignUnitAt(consensus, seq, cursor)
    if (!unit || units.length >= MAX_UNITS) {
      return undefined
    }
    units.push(unit)
    cursor += unit.consumed
  }
  return units
}

// The tiled alignment below is O(len^2), so it scores windows of the insert
// rather than all of it.
const IDENTITY_PROBE_LEN = 300

/**
 * Head, middle and tail of `seq`, or the whole of it when it is short enough to
 * score outright.
 *
 * Scoring only the head is how a prefix probe lies: `unit x 12` followed by a
 * kilobase of something else scores 1.00 on its first 300 bases and is not the
 * array's. Three windows cost the same and cannot be fooled that way, because
 * the sequence has to still be the unit where it ends as well as where it
 * starts.
 */
function probeWindows(seq: string) {
  if (seq.length <= IDENTITY_PROBE_LEN) {
    return [seq]
  }
  const middle = Math.floor((seq.length - IDENTITY_PROBE_LEN) / 2)
  return [
    seq.slice(0, IDENTITY_PROBE_LEN),
    seq.slice(middle, middle + IDENTITY_PROBE_LEN),
    seq.slice(-IDENTITY_PROBE_LEN),
  ]
}

/** the fraction of `probe`'s bases that match `unit` tiled end to end */
function tiledIdentity(probe: string, unit: string) {
  const n = probe.length
  if (!n || !unit.length) {
    return 0
  }
  // two spare copies so the alignment can start mid-copy and still run off the
  // end without paying for it
  const tile = unit.repeat(Math.ceil(n / unit.length) + 2)
  const m = tile.length
  const stride = m + 1
  const score = new Int32Array((n + 1) * stride)
  const matches = new Int32Array((n + 1) * stride)
  // row 0 stays zero: starting anywhere in the tiling is free
  for (let i = 1; i <= n; i++) {
    score[i * stride] = i * GAP
  }
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const hit = probe[i - 1] === tile[j - 1]
      const diagonal =
        score[(i - 1) * stride + j - 1]! + (hit ? MATCH : MISMATCH)
      const up = score[(i - 1) * stride + j]! + GAP
      const left = score[i * stride + j - 1]! + GAP
      const best = Math.max(diagonal, up, left)
      score[i * stride + j] = best
      matches[i * stride + j] =
        best === diagonal
          ? matches[(i - 1) * stride + j - 1]! + (hit ? 1 : 0)
          : best === up
            ? matches[(i - 1) * stride + j]!
            : matches[i * stride + j - 1]!
    }
  }
  let best = score[n * stride]!
  let bestMatches = matches[n * stride]!
  for (let j = 1; j <= m; j++) {
    if (score[n * stride + j]! > best) {
      best = score[n * stride + j]!
      bestMatches = matches[n * stride + j]!
    }
  }
  return bestMatches / n
}

/**
 * How much of `seq` is explained by `unit` repeated end to end, scored at three
 * places along it and reported as the worst of them.
 *
 * Each window is aligned free at both ends of the tiling, since an inserted run
 * of copies can start and stop mid-copy, and global on the window, since the
 * question is about all of it. That is what separates "more copies of this
 * array" from "something else that landed next to it" without asking the
 * sequence to be in phase with the unit — the ABCA7 read that carries 1207bp of
 * VNTR anchored outside the array begins six bases into a copy, and the FMR1
 * one begins on the wrong base of the unit and carries the locus's own AGG
 * interruptions.
 *
 * Measured against the trio: the repeat alleles the aligner anchored just
 * outside an array score 0.9 and up, and unrelated sequence of the same length
 * scores 0.67 or below.
 */
export function unitIdentity(seq: string, unit: string) {
  return Math.min(...probeWindows(seq).map(w => tiledIdentity(w, unit)))
}

export interface PeriodicAlignment {
  /** repeat unit length in bp */
  period: number
  /** each distinct input mapped to a gapped version, all the same length */
  gapped: Map<string, string>
  /** each distinct input mapped to its copy count */
  copies: Map<string, number>
  /** columns each copy occupies, left to right; sums to the gapped length */
  unitWidths: number[]
}

/**
 * Unit-per-block alignment of the sequences inserted at one reference position.
 *
 * Copy k of every sequence lands in the same block of columns, and a block is
 * as wide as the widest version of that copy across the site, so a sequence with
 * fewer copies runs out of blocks rather than drifting out of register. Returns
 * undefined when the site is not a tandem array, or is too big to lay out this
 * way; the caller falls back to the center-star alignment.
 *
 * **Blocks are array order, not homology.** Copies are anchored at the left edge
 * of the insertion and counted rightward, so block k is "the kth copy along",
 * and arrays grow and shrink by unequal crossing over anywhere inside them —
 * block 9 of a 12-copy allele and block 9 of a 20-copy allele need not be the
 * same copy. What the layout does buy is that copies stay in register, so a
 * single divergent copy shows up as a column instead of shifting every copy
 * after it. Reading down one row is sound; reading across two is a hypothesis.
 */
export function alignPeriodicInsertions(
  seqs: string[],
): PeriodicAlignment | undefined {
  const distinct = [...new Set(seqs)]
  const longest = distinct.reduce((a, b) => (b.length > a.length ? b : a), '')
  const period = detectPeriod(longest)
  if (period === undefined || period < MIN_PERIOD) {
    return undefined
  }
  return alignToUnit(distinct, consensusUnit(longest, period))
}

/**
 * Unit-per-block alignment against a unit the caller already knows.
 *
 * Separated from `alignPeriodicInsertions` because where the unit comes from is
 * the whole difference between the two ways of finding an array. Measured off
 * the inserted sequences, it can only be derived from one of them — the longest,
 * which is a guess that one chimeric read overturns for the whole site. Measured
 * off the reference, it is a property of the locus, so every read is laid out
 * against the same unit whatever the reads happen to be.
 *
 * An empty sequence is one of the alleles, not a missing one: a row that
 * deletes the whole array carries nought copies of it, which is a measurement
 * and the most extreme contraction there is. It splits into no units and so
 * lays out as a row of gaps the width of the block, which is what a deletion
 * should look like. Dropping it instead left that row indistinguishable from
 * one that never reached the array at all.
 */
export function alignToUnit(
  seqs: string[],
  consensus: string,
): PeriodicAlignment | undefined {
  const distinct = [...new Set(seqs)]
  const period = consensus.length
  if (!distinct.some(s => s.length) || period < MIN_PERIOD) {
    return undefined
  }

  const totalUnits = distinct.reduce(
    (a, s) => a + Math.ceil(s.length / period),
    0,
  )
  if (totalUnits * (period + 1) * (2 * period + 1) > MAX_SITE_CELLS) {
    return undefined
  }

  const splits = new Map<string, CenterSplit[]>()
  for (const seq of distinct) {
    const units = splitIntoUnits(seq, consensus)
    if (!units) {
      return undefined
    }
    splits.set(
      seq,
      units.map(u => splitAgainstCenter(u, period)),
    )
  }

  const maxUnits = Math.max(...[...splits.values()].map(u => u.length))
  const slotWidths: number[][] = []
  for (let k = 0; k < maxUnits; k++) {
    const widths = Array.from({ length: period + 1 }, () => 0)
    for (const unitSplits of splits.values()) {
      const split = unitSplits[k]
      if (split) {
        for (let j = 0; j <= period; j++) {
          widths[j] = Math.max(widths[j]!, split.slots[j]!.length)
        }
      }
    }
    slotWidths.push(widths)
  }
  const unitWidths = slotWidths.map(w => period + w.reduce((a, b) => a + b, 0))

  const gapped = new Map<string, string>()
  const copies = new Map<string, number>()
  for (const [seq, unitSplits] of splits) {
    let row = ''
    for (let k = 0; k < maxUnits; k++) {
      const split = unitSplits[k]
      row += split ? emit(split, slotWidths[k]!) : '-'.repeat(unitWidths[k]!)
    }
    gapped.set(seq, row)
    copies.set(seq, unitSplits.length)
  }
  return { period, gapped, copies, unitWidths }
}

export interface InsertionAlignment {
  /** each distinct input mapped to a gapped version, all of the same length */
  gapped: Map<string, string>
  /** present when the site is a tandem array */
  periodic?: PeriodicAlignment
}

/**
 * The sequence every other one at a site is aligned against: the one the most
 * reads carry, so a single chimeric outlier cannot gap every row. Ties go to
 * the length nearest the median, then lexicographically, so the choice is a
 * function of the input and not of the order reads arrived in.
 */
function chooseCenter(seqs: string[]) {
  const counts = new Map<string, number>()
  for (const seq of seqs) {
    counts.set(seq, (counts.get(seq) ?? 0) + 1)
  }
  const lengths = seqs.map(s => s.length).sort((a, b) => a - b)
  const median =
    (lengths[(lengths.length - 1) >> 1]! + lengths[lengths.length >> 1]!) / 2
  const offMedian = (seq: string) => Math.abs(seq.length - median)
  return [...counts].sort(
    ([a, countA], [b, countB]) =>
      countB - countA || offMedian(a) - offMedian(b) || (a < b ? -1 : 1),
  )[0]![0]
}

/**
 * Every distinct sequence aligned to the center and widened to the same set of
 * columns, or undefined when the alignments would exceed the site's budget.
 */
function alignAroundCenter(seqs: string[], distinct: string[]) {
  const center = chooseCenter(seqs)
  const budget: Budget = { cells: MAX_SITE_CELLS }
  const others = distinct.filter(s => s !== center)
  const splits: CenterSplit[] = []
  for (const seq of others) {
    const pair = alignGlobal(center, seq, budget)
    if (pair) {
      splits.push(splitAgainstCenter(pair, center.length))
    }
  }
  const slotWidths = Array.from({ length: center.length + 1 }, (_, j) =>
    splits.reduce((max, s) => Math.max(max, s.slots[j]!.length), 0),
  )
  const centerSplit: CenterSplit = {
    slots: slotWidths.map(() => ''),
    atCenter: center,
  }
  return splits.length === others.length
    ? new Map([
        [center, emit(centerSplit, slotWidths)],
        ...others.map((seq, i): [string, string] => [
          seq,
          emit(splits[i]!, slotWidths),
        ]),
      ])
    : undefined
}

/**
 * Lay out the sequences inserted at one reference position, one entry per
 * read, by whichever of the two alignments the sequence itself calls for. The
 * single place that decision is made, so a caller reading the period cannot
 * disagree with the layout it gets.
 *
 * A tandem array goes unit-per-block, which is the readable answer however many
 * copies it has. Everything else gets the center-star alignment, or is left
 * alone (`gapped` empty) when there is nothing to gain from a single distinct
 * sequence, or the alignments would cost more than the site's budget.
 */
export function alignInsertionSite(seqs: string[]): InsertionAlignment {
  const distinct = [...new Set(seqs)]
  // an array is worth unrolling even when every read agrees on it: the copies
  // still have to be squared up with each other before they can be counted
  const periodic = alignPeriodicInsertions(distinct)
  return periodic
    ? { gapped: periodic.gapped, periodic }
    : {
        gapped:
          (distinct.length > 1 && alignAroundCenter(seqs, distinct)) ||
          new Map<string, string>(),
      }
}
