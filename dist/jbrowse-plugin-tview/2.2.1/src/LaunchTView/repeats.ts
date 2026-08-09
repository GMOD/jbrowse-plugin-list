/**
 * Finding tandem arrays in the *reference*, rather than in what the reads
 * inserted.
 *
 * The insertion-anchored reading — "an array is the sequence some read inserted
 * at one reference position" — is what the aligner happens to produce, not what
 * is there. Measured against the GIAB trio at HTT, ATXN3 and TCF4 it fails in
 * three ways at once:
 *
 * - **The array is already in the reference.** A read's insertion is only its
 *   allele's *excess* over the reference copy count, so `n=5` at HTT means five
 *   copies more than hg19's, not a five-copy allele. A contracted allele inserts
 *   nothing at all and vanishes from the site.
 * - **One array reports as several sites.** An indel inside an array has no
 *   unique placement, so the aligner anchors different reads at different
 *   positions: ATXN3 in HG002 came back as four separate arrays at 92537353,
 *   ...354, ...358 and ...372, splitting one locus's alleles across four counts.
 * - **A read that spans the array without an insertion is invisible**, so the
 *   reference-length allele — usually the commonest one — is never counted.
 *
 * Anchoring on a reference interval fixes all three: the interval is the same
 * for every read, so an allele is "what this read has between here and here",
 * however the aligner chose to write it, and the reference is just another
 * allele.
 */

// scoring for the lag-p self-comparison below. A match fraction of 0.75 scores
// zero, so a real array (~85% identity between copies, plus read error on the
// reference's own history) accumulates and random sequence (25%) does not.
const LAG_MATCH = 1
const LAG_MISMATCH = -3

// Shortest unit worth reporting. A homopolymer is periodic at every lag and its
// unit is an arbitrary slice of one run, so period 1 is not a unit.
export const MIN_PERIOD = 2

// Longest unit scanned. Covers STRs and the common VNTR range. The scan is
// O(regionLength * MAX_PERIOD), which is what bounds this rather than biology.
export const MAX_PERIOD = 300

// Copies needed before a run counts as an array. At two the period cannot be
// told from the sequence alone, and two copies of anything is a duplication.
export const MIN_COPIES = 3

// Shortest array worth reporting, regardless of copies. Three copies of a
// dinucleotide is six bases, which occurs by chance every few hundred bases —
// a TP53 exon scanned as a control turned up two — and firing the whole
// unit-per-block layout on one would relabel an ordinary pileup.
const MIN_SPAN = 12

export interface ReferenceArray {
  /** reference position the array starts at, inclusive */
  start: number
  /** reference position the array ends at, exclusive */
  end: number
  /** repeat unit length in bp */
  period: number
  /** the reference's own first copy, used as the alignment consensus */
  unit: string
}

/**
 * Runs where `scores` stays positive on balance, each cut back to where it
 * scored best.
 *
 * A run is opened at the first positive score, extended while the running total
 * stays above zero, and closed at its peak — so the mismatching tail that ended
 * it is not part of the array, and neither are the short mismatch stretches
 * inside it that the total absorbed. Restarting after each close is what lets
 * one pass find every array of a given period, which a region routinely carries
 * several of.
 */
function positiveRuns(scores: Int32Array) {
  const ret: { start: number; end: number }[] = []
  let start = -1
  let total = 0
  let best = 0
  let bestEnd = -1
  const close = () => {
    if (bestEnd > start) {
      ret.push({ start, end: bestEnd })
    }
    start = -1
    total = 0
    best = 0
    bestEnd = -1
  }
  for (let i = 0; i < scores.length; i++) {
    if (start < 0) {
      if (scores[i]! <= 0) {
        continue
      }
      start = i
    }
    total += scores[i]!
    if (total > best) {
      best = total
      bestEnd = i + 1
    } else if (total <= 0) {
      close()
    }
  }
  close()
  return ret
}

/** Arrays of exactly `period`, as intervals into `seq`. */
function arraysOfPeriod(seq: string, period: number) {
  const n = seq.length - period
  if (n <= 0) {
    return []
  }
  const scores = new Int32Array(n)
  for (let i = 0; i < n; i++) {
    scores[i] = seq[i] === seq[i + period] ? LAG_MATCH : LAG_MISMATCH
  }
  const minSpan = Math.max(MIN_SPAN, MIN_COPIES * period)
  return positiveRuns(scores)
    .map(s => ({
      // a lag-p match at the last scored position still asserts p more bases
      start: s.start,
      end: s.end + period,
      period,
    }))
    .filter(s => s.end - s.start >= minSpan)
}

/**
 * Tandem arrays in `seq`, which is the reference over the viewed region
 * starting at `offset`.
 *
 * Scanning periods upward and refusing to start an array inside one already
 * found is what reports a 3bp array as 3bp rather than as 6bp or 9bp: every
 * multiple of a real period scores just as well, and the smallest one is the
 * unit. It also means a long array with a short unit hides a spurious long-unit
 * one inside it, which is the failure mode of scanning periods independently.
 */
export function findReferenceArrays(seq: string, offset = 0) {
  const upper = seq.toUpperCase()
  const claimed = new Uint8Array(upper.length)
  const ret: ReferenceArray[] = []
  const maxPeriod = Math.min(MAX_PERIOD, Math.floor(upper.length / MIN_COPIES))
  for (let period = MIN_PERIOD; period <= maxPeriod; period++) {
    for (const span of arraysOfPeriod(upper, period)) {
      let free = 0
      for (let i = span.start; i < span.end; i++) {
        free += claimed[i] ? 0 : 1
      }
      // mostly inside an array already reported at a shorter period, so it is
      // that array's higher harmonic rather than an array of its own
      if (free < 0.5 * (span.end - span.start)) {
        continue
      }
      const unit = upper.slice(span.start, span.start + period)
      // a homopolymer is periodic at every lag, so it turns up here as an
      // array of `AA` or `AAA` whose unit boundary is an arbitrary cut through
      // one run of A. Counting its copies is counting its length in twos.
      if (new Set(unit).size < 2) {
        continue
      }
      for (let i = span.start; i < span.end; i++) {
        claimed[i] = 1
      }
      ret.push({
        start: offset + span.start,
        end: offset + span.end,
        period,
        unit,
      })
    }
  }
  return ret.sort((a, b) => a.start - b.start || a.period - b.period)
}

/**
 * How much of the merged interval an array has to cover before its period is a
 * candidate to name the whole thing. A dinucleotide abutting a VNTR should not
 * rename it; two descriptions of the same locus should compete.
 */
const RIVAL_SPAN_FRACTION = 0.5

/**
 * Merge arrays that touch or overlap into one interval, named by the shortest
 * period that describes most of it.
 *
 * An allele is measured over an interval, so two intervals sharing reference
 * positions would measure the same read bases twice. Overlaps are the norm
 * rather than an edge case, because one locus is genuinely periodic at more
 * than one lag: the ABCA7 VNTR's copies are 25 and 26 bases long, so it scans
 * as a 25mer array, a 26mer array and — over the stretch where the two
 * alternate — a 77mer one, all describing the same 466 bases. Taking the
 * shortest period among the rivals reports it as the 25bp unit it is known by,
 * rather than as a 77bp unit that is three copies wearing one name.
 */
export function mergeArrays(arrays: ReferenceArray[], gap = 0) {
  const groups: ReferenceArray[][] = []
  for (const array of [...arrays].sort((a, b) => a.start - b.start)) {
    const last = groups.at(-1)
    const end = last ? Math.max(...last.map(a => a.end)) : 0
    if (last && array.start <= end + gap) {
      last.push(array)
    } else {
      groups.push([array])
    }
  }
  return groups.map(group => {
    const span = (a: ReferenceArray) => a.end - a.start
    const widest = Math.max(...group.map(span))
    const rivals = group.filter(a => span(a) >= RIVAL_SPAN_FRACTION * widest)
    const named = rivals.reduce((a, b) => (b.period < a.period ? b : a))
    return {
      start: Math.min(...group.map(a => a.start)),
      end: Math.max(...group.map(a => a.end)),
      period: named.period,
      unit: named.unit,
    }
  })
}
