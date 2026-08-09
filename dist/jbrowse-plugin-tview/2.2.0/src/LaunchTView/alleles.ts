import { alignToUnit, unitIdentity } from './align'

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

const SPANNED_GAP = '-'
const ABSENT = '.'

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

/** Reference positions an array owns, including the insertion slot at its right edge. */
export function arrayInsertionKeys(array: { start: number; end: number }) {
  const ret: number[] = []
  for (let pos = array.start; pos <= array.end; pos++) {
    ret.push(pos)
  }
  return ret
}

/**
 * How far outside an array an insertion of its own unit can be anchored, in
 * copies. An indel made of repeat units has no unique placement inside the
 * array, and the flanking bases let the aligner carry it a little further still
 * — but only about a copy, because past that the sequence either side stops
 * matching. Every misplaced repeat allele in the trio sits within one copy of
 * the edge: ATXN3's at 1bp, FMR1's at 2bp of a 3bp unit, ABCA7's at 19bp of a
 * 25bp one.
 */
const ABSORB_COPIES = 1

/**
 * How much of the inserted sequence the array's unit has to explain before the
 * insertion counts as part of the array. The repeat alleles the aligner
 * anchored just outside an array in the trio score 0.94-1.00 here and unrelated
 * sequence scores 0.67 or below, so this sits in open space rather than on a
 * boundary.
 */
const ABSORB_IDENTITY = 0.8

/**
 * Widen each array to cover the insertions the aligner anchored just outside it
 * that are made of the array's own unit.
 *
 * An allele is measured over a reference interval, which fixes the "one array
 * reports as several sites" problem for indels the aligner placed *inside* the
 * interval. It does not fix the ones it placed just outside: an aligner is free
 * to anchor an expansion at the base before the array starts, and there the
 * insertion is not part of any allele — it is left to become its own run of
 * insertion columns, and the read it belongs to is measured as if it carried
 * the reference allele. Both halves of that are wrong, and they are not rare:
 * at ATXN3 the aligner anchored 60 of 162 reads' expansions one base outside
 * the array, and at ABCA7 a 1207bp allele 19 bases outside.
 *
 * What is absorbed is decided by the inserted sequence, not by the count of
 * reads carrying it — a single read's expansion is as real as fifty, and the
 * whole point of measuring over an interval is that it does not need a vote.
 * Widening the interval costs every row the few reference bases in between,
 * which they all pay equally, so the counts stay comparable.
 */
export function absorbAdjacentInsertions(
  reads: ReadLayout[],
  arrays: ReferenceArray[],
) {
  const ordered = [...arrays].sort((a, b) => a.start - b.start)
  // the widened end of the array to the left, which the next one may not reach
  let previousEnd = -Infinity
  return ordered.map((array, i) => {
    const margin = ABSORB_COPIES * array.period
    // Two arrays that met at a position would read the same insertion slot
    // twice — once as each one's allele — so they are held apart on both
    // sides: leftwards off whatever the previous array grew to, rightwards off
    // where the next one starts, which is as far left as that one can be
    // pushed in turn. Neither bound can cross the array's own edges, since
    // mergeArrays has already left a gap between every pair.
    const floor = Math.max(array.start - margin, previousEnd + 1)
    const ceiling = Math.min(
      array.end + margin,
      (ordered[i + 1]?.start ?? Infinity) - 1,
    )
    let { start, end } = array
    // memoized per distinct insert: one locus routinely has dozens of reads
    // carrying the same allele at the same site
    const belongs = new Map<string, boolean>()
    const isUnit = (ins: string) => {
      let ret = belongs.get(ins)
      if (ret === undefined) {
        ret = unitIdentity(ins, array.unit) >= ABSORB_IDENTITY
        belongs.set(ins, ret)
      }
      return ret
    }
    for (const read of reads) {
      for (const [pos, ins] of read.insertions) {
        // a whole copy at least: a base or two of read error next to an array
        // says nothing about where the array ends, and moving the interval for
        // it would lay flanking sequence out as repeat copies
        if (
          ins.length < array.period ||
          pos < floor ||
          pos > ceiling ||
          (pos >= array.start && pos <= array.end) ||
          !isUnit(ins)
        ) {
          continue
        }
        start = Math.min(start, pos)
        // an insertion is keyed to the position it precedes, and extractAllele
        // reads the slot at `end`, so covering it means reaching that position
        end = Math.max(end, pos)
      }
    }
    previousEnd = end
    return { ...array, start, end }
  })
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
