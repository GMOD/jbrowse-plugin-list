import { alignToUnit, unitIdentity } from './align'
import { ABSENT, SPANNED_GAP } from './readLayout'

import type { ReadLayout } from './readLayout'
import type { ReferenceArray } from './repeats'

/**
 * A tandem array laid out as one block of columns per copy, replacing the
 * reference columns the array covers.
 *
 * The interval comes from the reference and the unit comes with it, so every
 * row is measured over the same span against the same unit. That is what makes
 * the counts comparable: a read's allele is what it has between here and here,
 * whatever the aligner did with the gap, and the reference is just the row whose
 * allele the coordinates are named after.
 */
export interface ArrayBlock {
  /** reference position the array starts at, inclusive */
  start: number
  /** reference position the array ends at, exclusive */
  end: number
  period: number
  unit: string
  /** columns the block occupies */
  width: number
  /** columns each copy occupies, left to right; sums to `width` */
  unitWidths: number[]
  /** gapped block, by row name; only rows whose allele could be measured */
  rowByName: Map<string, string>
  /** copies carried, by row name */
  copiesByName: Map<string, number>
  /** allele length in bp, by row name */
  lengthByName: Map<string, number>
}

/**
 * What one row has between two reference positions: its matched bases, plus
 * whatever it inserted inside, minus whatever it deleted.
 *
 * This is the measurement the insertion-anchored reading cannot make. An indel
 * inside an array has no unique placement, so two reads carrying the same allele
 * can disagree about which reference position it is inserted at and by how much;
 * summed over the interval, those choices cancel and both come back the same
 * length. Undefined when the row does not reach both edges — copies cannot be
 * counted from a read that stops inside the array, and guessing from a partial
 * one is how a truncated read reads as a contracted allele.
 */
export function extractAllele(read: ReadLayout, start: number, end: number) {
  const last = read.start + read.refChars.length
  if (read.start > start || last < end) {
    return undefined
  }
  let ret = ''
  for (let pos = start; pos <= end; pos++) {
    ret += read.insertions.get(pos) ?? ''
    if (pos < end) {
      const char = read.refChars[pos - read.start]!
      if (char === ABSENT) {
        // an N op skips the position rather than deleting it, so the row has no
        // allele here at all rather than a shorter one
        return undefined
      }
      if (char !== SPANNED_GAP) {
        ret += char
      }
    }
  }
  return ret
}

/**
 * How far outside an array an insertion is looked for, in reference bases.
 *
 * GIAB's adotto tandem repeat catalog buffers every interval by +/-25bp before
 * merging, to leave room for the alignment ambiguity that comes with capturing
 * variation inside a repeat, and measured what the buffer misses: re-expanding
 * every region by a further 10bp would move only 0.2% of its boundaries
 * (English et al., Nat Biotechnol 42, 2024, doi:10.1038/s41587-024-02225-z). A
 * whole copy is the floor for a unit longer than that, since a copy is the
 * aligner's room to slide a repeat indel. Both cover the misplacements measured
 * in this trio: ATXN3 at 1bp, FMR1 at 2bp of a 3bp unit, ABCA7 at 19bp of a
 * 25bp one.
 *
 * It bounds the search, not the answer. Whether an insertion actually moves is
 * decided exactly, by `shiftInsertion`, so this being generous costs nothing.
 */
const FLANK_BP = 25

/** the read's aligned base at a reference position, if it has one there */
function readBase(read: ReadLayout, pos: number) {
  const i = pos - read.start
  return i >= 0 && i < read.refChars.length ? read.refChars[i] : undefined
}

/**
 * How much of an insertion the array's unit has to explain before it counts as
 * the array's. The repeat alleles the aligner anchored just outside an array in
 * the trio score 0.9 and up, and unrelated sequence scores 0.67 or below, so
 * this sits in open space rather than on a boundary.
 */
const BELONGS_IDENTITY = 0.8

/**
 * `ins`, inserted before reference position `from`, rewritten as an insertion
 * before `to` — or undefined when the read's own bases do not allow it.
 *
 * An insertion has no unique position. `S` before a base `b` and `rotate(S)`
 * after it spell the same read, so an aligner is free to anchor an expansion
 * outside the array it belongs to, and at ATXN3 it did exactly that for most of
 * the reads carrying one. Walking an indel through that equivalence class is
 * the standard normalization for it (Tan, Abecasis & Kang, "Unified
 * representation of genetic variants", Bioinformatics 31, 2015,
 * doi:10.1093/bioinformatics/btv112, which walks left; this walks toward the
 * array, the same operation with the array as the canonical anchor).
 *
 * The step is tested against the **read's** aligned base rather than the
 * reference's, which is what makes the rewrite exact: the row still renders
 * base for base as it did, and the only thing that changes is the reference
 * position the bases are filed under. A step onto a deletion has no base to
 * swap with and stops.
 *
 * Being exact, it is also incomplete, and measurably so. An aligner does not
 * only choose among equivalent placements — it chooses the highest-scoring one,
 * which for a repeat allele carrying an interruption is often not equivalent to
 * any placement inside the array. FMR1's misplaced read is exactly that: 32bp
 * of the locus's own CGG anchored two bases early, starting on a `C` where the
 * read has a `G`, so no rewrite of it exists. Hence `reanchorInsertions` treats
 * this as the preferred spelling and not as the test of whether to move.
 */
export function shiftInsertion(
  read: ReadLayout,
  from: number,
  to: number,
  ins: string,
) {
  let seq = ins
  for (let pos = from; pos < to; pos++) {
    const head = seq[0]!
    if (readBase(read, pos) !== head) {
      return undefined
    }
    seq = seq.slice(1) + head
  }
  for (let pos = from - 1; pos >= to; pos--) {
    const tail = seq.at(-1)!
    if (readBase(read, pos) !== tail) {
      return undefined
    }
    seq = tail + seq.slice(0, -1)
  }
  return seq
}

/**
 * `ins`, inserted before `from`, moved to before `to` by re-dividing the read's
 * own bases between the two: the bases it passes over and the inserted ones
 * are one run of the read, and the move only changes which of them are called
 * inserted. Unlike `shiftInsertion` it moves whether or not the bases agree,
 * so the row may come out with mismatches it did not have; it still spells the
 * read exactly. Undefined where the read has no base at a position passed
 * over, or does not reach the target.
 */
export function moveInsertion(
  read: ReadLayout,
  from: number,
  to: number,
  ins: string,
) {
  const lo = Math.min(from, to) - read.start
  const hi = Math.max(from, to) - read.start
  const passed = read.refChars.slice(lo, hi)
  const rightward = from < to
  const spelled = rightward ? ins + passed : passed + ins
  return lo < 0 ||
    hi > read.refChars.length ||
    passed.includes(SPANNED_GAP) ||
    passed.includes(ABSENT)
    ? undefined
    : {
        seq: rightward
          ? spelled.slice(passed.length)
          : spelled.slice(0, ins.length),
        refChars:
          read.refChars.slice(0, lo) +
          (rightward
            ? spelled.slice(0, passed.length)
            : spelled.slice(ins.length)) +
          read.refChars.slice(hi),
      }
}

/** an array with the span of reference positions whose insertions it may claim */
interface FlankWindow {
  array: ReferenceArray
  from: number
  to: number
}

/**
 * The window around each array that its insertions may be re-anchored from.
 *
 * Two arrays may not claim one position: `extractAllele` reads the slot at an
 * array's `end`, so a shared slot would be counted into two alleles. Neighbours
 * split the reference between them down the middle — a property of the
 * reference alone, so unlike the interval it replaces, no read can move it.
 */
export function flankWindows(arrays: ReferenceArray[]): FlankWindow[] {
  const ordered = [...arrays].sort((a, b) => a.start - b.start)
  return ordered.map((array, i) => {
    const pad = Math.max(FLANK_BP, array.period)
    const previous = ordered[i - 1]
    const next = ordered[i + 1]
    return {
      array,
      from: Math.max(
        array.start - pad,
        previous ? Math.floor((previous.end + array.start) / 2) + 1 : -Infinity,
      ),
      to: Math.min(
        array.end + pad,
        next ? Math.floor((array.end + next.start) / 2) : Infinity,
      ),
    }
  })
}

/** the array whose window `pos` falls in, if any */
function windowAt(pos: number, windows: FlankWindow[]) {
  for (const window of windows) {
    if (pos < window.from) {
      return undefined
    }
    if (pos <= window.to) {
      return window
    }
  }
  return undefined
}

/**
 * Re-file each read's insertions under the array they belong to, one read at a
 * time.
 *
 * Measuring an allele over a reference interval fixes the "one array reports as
 * several sites" problem for indels the aligner placed *inside* the interval.
 * It does not fix the ones placed just outside: there the insertion is part of
 * no allele — it becomes its own run of insertion columns — and the read
 * carrying it is measured as though it had the reference allele. Both halves of
 * that are wrong, and neither is rare: at ATXN3 the aligner anchored 60 of 162
 * reads' expansions one base outside the array.
 *
 * Doing this per read is the whole point. Widening the shared interval instead
 * — which is what this replaces — made one read's misplacement everyone's: a
 * single spurious copy anchored two bases early moved the array's left edge for
 * every row, and the reference's own copy count with it. Re-anchoring touches
 * only the read that carries the insertion, so a read can be wrong on its own.
 *
 * Nothing here consults the other reads, or how many of them agree. A single
 * read's expansion is as real as fifty, which is what measuring over an
 * interval buys and what a vote would give back. What decides an insertion is
 * its own sequence: `unitIdentity` against the array's unit, since the aligner
 * is free to place a repeat allele outside the array but is not free to make
 * unrelated sequence out of the array's unit.
 */
export function reanchorInsertions(
  reads: ReadLayout[],
  arrays: ReferenceArray[],
) {
  const windows = flankWindows(arrays)
  if (!windows.length) {
    return reads
  }
  // memoized per array and distinct insert: one locus routinely has dozens of
  // reads carrying the same allele at the same site
  const belongs = new Map<string, boolean>()
  const isUnit = (window: FlankWindow, ins: string) => {
    const key = `${window.array.start}:${ins}`
    let ret = belongs.get(key)
    if (ret === undefined) {
      ret =
        // a whole copy at least: a base or two of read error beside an array
        // says nothing about where its allele ends, and the identity of a
        // fragment shorter than the unit is not a measurement of anything
        ins.length >= window.array.period &&
        unitIdentity(ins, window.array.unit) >= BELONGS_IDENTITY
      belongs.set(key, ret)
    }
    return ret
  }
  return reads.map(read => {
    if (!read.insertions.size) {
      return read
    }
    let moved = false
    const next = new Map<number, string>()
    // Insertions are re-filed in genomic order of where the aligner put them,
    // so two events landing in one slot keep their order along the read.
    for (const [pos, ins] of [...read.insertions].sort((a, b) => a[0] - b[0])) {
      const window = windowAt(pos, windows)
      const { start, end } = window?.array ?? {}
      const target =
        window === undefined || (pos >= start! && pos <= end!)
          ? undefined
          : isUnit(window, ins)
            ? pos < start!
              ? start!
              : end!
            : undefined
      // an exact rewrite is preferred where one exists, so a row that can be
      // re-spelled reads base for base as the aligner wrote it; where none
      // exists the bases move as written, which preserves the length the
      // measurement is made of
      const at = target ?? pos
      moved ||= target !== undefined
      const seq =
        target === undefined
          ? ins
          : (shiftInsertion(read, pos, target, ins) ?? ins)
      next.set(at, (next.get(at) ?? '') + seq)
    }
    return moved ? { ...read, insertions: next } : read
  })
}

function mod(a: number, b: number) {
  return ((a % b) + b) % b
}

/**
 * `ins`, inserted before `pos`, walked left through the read's own bases for as
 * long as each step spells the same read, and no further than `floor`.
 */
function walkLeft(read: ReadLayout, pos: number, ins: string, floor: number) {
  let at = pos
  while (
    at > floor &&
    readBase(read, at - 1) === ins[mod(ins.length - 1 - (pos - at), ins.length)]
  ) {
    at--
  }
  const cut = ins.length - mod(pos - at, ins.length)
  return { at, seq: ins.slice(cut) + ins.slice(0, cut) }
}

/**
 * Re-file each insertion no array owns at the leftmost position that spells the
 * same read, so reads carrying one event agree on its site.
 *
 * This is `shiftInsertion`'s equivalence walked as far as it holds rather than
 * to a target, which is the left-normalization of Tan, Abecasis & Kang. It runs
 * after `reanchorInsertions`, leaves alone any insertion from an array's `start`
 * to its `end` inclusive, and walks none into that span, so no allele an array
 * measures changes. The walk also stops one base inside the region's start, so
 * an insertion in view keeps a reference base on both sides of it, at the
 * read's own start, and at any position where the read has no base. Two insertions of one read that meet keep their order along
 * it.
 */
export function normalizeInsertions(
  reads: ReadLayout[],
  arrays: ReferenceArray[],
  regionStart: number,
) {
  const owned = (pos: number) =>
    arrays.some(array => pos >= array.start && pos <= array.end)
  const arrayFloor = (pos: number) =>
    Math.max(
      -Infinity,
      ...arrays.filter(array => array.end < pos).map(array => array.end + 1),
    )
  return reads.map(read => {
    let moved = false
    let previous = -Infinity
    const next = new Map<number, string>()
    for (const [pos, ins] of [...read.insertions].sort((a, b) => a[0] - b[0])) {
      const { at, seq } = owned(pos)
        ? { at: pos, seq: ins }
        : walkLeft(
            read,
            pos,
            ins,
            Math.max(regionStart + 1, read.start, arrayFloor(pos), previous),
          )
      next.set(at, (next.get(at) ?? '') + seq)
      moved ||= at !== pos
      previous = at
    }
    return moved ? { ...read, insertions: next } : read
  })
}

/*
 * The four constants below were swept over HG002's PacBio HiFi reads at the
 * NPHP4 Alu and at 80 insertions from the GIAB HG002 SV benchmark (v0.6,
 * GRCh37: PASS, 50 to 2000bp, outside segmental duplications, 40 in tandem
 * repeats and 40 not, taken evenly through the file), each in a 200bp window.
 * Unmerged those windows have 102 insertion sites 10 or more columns wide,
 * holding 34,876 insertion columns; at these values, 85 sites and 28,425.
 */

/**
 * Shortest insertion that is moved, or that draws others. Every value from 2
 * to 20 merges the same sites. At 1 the 1bp read errors scattered through the
 * windows are dragged into each other, 85 sites of them; at 50 a chr18 VNTR's
 * 26 to 30bp allele stays split, and so does a 49 to 51bp insertion on chr5.
 */
const MERGE_MIN_BP = 10

/**
 * Farthest an insertion is moved. The farthest merge measured is 20bp: at
 * 22:47,740,767 six reads carry a 61bp insertion 20bp from where fourteen
 * others put it, and the bases between spell the same, so moving them costs
 * nothing. Nothing more merges between 25 and 60.
 */
const MERGE_REACH_BP = 25

/**
 * How far a read's insertion length may be from the median at the site it
 * joins, as a fraction of that median. One event read twice came out up to 13%
 * apart (26 and 30bp of one chr18 VNTR allele; 8% for a 76bp one), and the
 * different events within reach at least 53% apart (a 29bp allele beside a 62bp
 * one, a 38bp insertion beside a 532bp one) — and both of those would have
 * moved for free, so this is what keeps them apart, not the mismatches.
 */
const MERGE_LENGTH_SPREAD = 0.2

/**
 * Most mismatches against the reference a move may add to its row, net of
 * those the bases it passes already had. Since a move cannot add more than the
 * bases it passes, a read 1 or 2bp off always merges, and one farther off only
 * where the bases between nearly agree. At this cap 49 reads move, 45 of them
 * adding one mismatch or none. The costs do not fall into two groups: a cap of
 * 3 moves 6 more reads, 3 to 7bp off, and each step up after that moves a few
 * more, at about one mismatch for every two bases passed, which is what
 * unrelated sequence costs.
 */
const MERGE_MAX_MISMATCHES = 2

function median(values: number[]) {
  return [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]!
}

function differences(a: string, b: string) {
  let ret = 0
  for (let i = 0; i < a.length; i++) {
    ret += a[i] === b[i] ? 0 : 1
  }
  return ret
}

/**
 * `read` with its insertion `ins` moved from `from` to `to`, unless another of
 * its insertions lies in between, it has no base on a position passed over, or
 * the move adds more than `MERGE_MAX_MISMATCHES` against the reference.
 */
function mergedRead(
  read: ReadLayout,
  from: number,
  to: number,
  ins: string,
  reference: { seq: string; start: number },
) {
  const lo = Math.min(from, to)
  const hi = Math.max(from, to)
  const moved = [...read.insertions.keys()].some(
    pos => pos !== from && pos >= lo && pos <= hi,
  )
    ? undefined
    : moveInsertion(read, from, to, ins)
  const passed = (refChars: string) =>
    refChars.slice(lo - read.start, hi - read.start)
  const ref = reference.seq.slice(lo - reference.start, hi - reference.start)
  const insertions = new Map(read.insertions)
  insertions.delete(from)
  return moved &&
    differences(passed(moved.refChars), ref) -
      differences(passed(read.refChars), ref) <=
      MERGE_MAX_MISMATCHES
    ? {
        ...read,
        refChars: moved.refChars,
        insertions: insertions.set(to, moved.seq),
      }
    : undefined
}

/**
 * Move each long insertion to a nearby site more reads use, when the read
 * inserts about as much there and the move costs its row no more than a
 * mismatch or two against the reference.
 *
 * Left-normalization is exact, so it brings reads together only where their
 * bases allow it. A read with a sequencing error at the boundary, or anchored a
 * base or two off by the aligner, keeps a site of its own, and every other row
 * pays for that site with a run of gap columns as wide as the insertion.
 * `moveInsertion` re-divides the read's own bases, so the row still spells the
 * read; what the move gives up is that some of them now sit on reference
 * positions they do not match.
 *
 * Sites are visited by the reads inserting there, most first and ties to the
 * leftmost. Each insertion at a site goes to the first site already kept that
 * is within reach, of a similar length, and admits the move, and a site keeps
 * its place if any read still inserts there. Like `normalizeInsertions`, this
 * touches no position from an array's `start` to its `end`, keeps an insertion
 * in view a base inside the region, and keeps a read's insertions in order.
 */
export function mergeInsertionSites(
  reads: ReadLayout[],
  arrays: ReferenceArray[],
  reference: { seq: string; start: number },
) {
  const touchesArray = (lo: number, hi: number) =>
    arrays.some(array => array.start <= hi && array.end >= lo)
  const holders = new Map<number, number[]>()
  reads.forEach((read, i) => {
    for (const [pos, ins] of read.insertions) {
      if (ins.length >= MERGE_MIN_BP && !touchesArray(pos, pos)) {
        holders.set(pos, [...(holders.get(pos) ?? []), i])
      }
    }
  })
  const reaches = (
    target: { pos: number; length: number },
    pos: number,
    length: number,
  ) =>
    target.pos > reference.start &&
    Math.abs(target.pos - pos) <= MERGE_REACH_BP &&
    Math.abs(length - target.length) <= MERGE_LENGTH_SPREAD * target.length &&
    !touchesArray(Math.min(pos, target.pos), Math.max(pos, target.pos))
  const ret = [...reads]
  const kept: { pos: number; length: number }[] = []
  for (const [pos, indices] of [...holders].sort(
    (a, b) => b[1].length - a[1].length || a[0] - b[0],
  )) {
    const stayed: number[] = []
    for (const i of indices) {
      const read = ret[i]!
      const ins = read.insertions.get(pos) ?? ''
      const moved = kept
        .filter(target => reaches(target, pos, ins.length))
        .reduce<ReadLayout | undefined>(
          (found, target) =>
            found ?? mergedRead(read, pos, target.pos, ins, reference),
          undefined,
        )
      if (moved) {
        ret[i] = moved
      } else {
        stayed.push(ins.length)
      }
    }
    if (stayed.length) {
      kept.push({ pos, length: median(stayed) })
    }
  }
  return ret
}

/**
 * Lay every row's allele out unit-per-block, one block per array.
 *
 * Arrays whose alleles are all one length still get a block: squaring the copies
 * up against each other is what turns "this row is 63 bases long" into "this row
 * has 21 copies and the 12th one differs", and that is true whether or not the
 * rows disagree.
 */
export function buildArrayBlocks(
  reads: ReadLayout[],
  arrays: ReferenceArray[],
) {
  const ret: ArrayBlock[] = []
  for (const array of arrays) {
    const alleleByName = new Map<string, string>()
    for (const read of reads) {
      const allele = extractAllele(read, array.start, array.end)
      if (allele !== undefined) {
        alleleByName.set(read.name, allele)
      }
    }
    const aligned = alignToUnit([...alleleByName.values()], array.unit)
    if (!aligned) {
      continue
    }
    const rowByName = new Map<string, string>()
    const copiesByName = new Map<string, number>()
    const lengthByName = new Map<string, number>()
    for (const [name, allele] of alleleByName) {
      const row = aligned.gapped.get(allele)
      const copies = aligned.copies.get(allele)
      if (row !== undefined && copies !== undefined) {
        rowByName.set(name, row)
        copiesByName.set(name, copies)
        lengthByName.set(name, allele.length)
      }
    }
    ret.push({
      start: array.start,
      end: array.end,
      period: aligned.period,
      unit: array.unit,
      width: aligned.unitWidths.reduce((a, b) => a + b, 0),
      unitWidths: aligned.unitWidths,
      rowByName,
      copiesByName,
      lengthByName,
    })
  }
  return ret
}
