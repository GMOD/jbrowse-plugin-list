import type { TrackStat } from './proteinColor'

export interface Interval {
  start: number
  end: number
}

export interface ScoredInterval extends Interval {
  score: number
}

function lowerBound(sorted: readonly number[], value: number) {
  let lo = 0
  let hi = sorted.length
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (sorted[mid]! < value) {
      lo = mid + 1
    } else {
      hi = mid
    }
  }
  return lo
}

/**
 * The score on each base of `bases`, from 0-based half-open intervals. Where
 * intervals overlap a base the highest score counts, so the result does not
 * depend on the order they arrive in.
 */
export function scoreByBase(
  intervals: readonly ScoredInterval[],
  bases: readonly number[],
) {
  const sorted = bases.toSorted((a, b) => a - b)
  const scores = new Map<number, number>()
  for (const { start, end, score } of intervals) {
    if (!Number.isFinite(score)) {
      continue
    }
    for (
      let i = lowerBound(sorted, start);
      i < sorted.length && sorted[i]! < end;
      i++
    ) {
      const base = sorted[i]!
      const seen = scores.get(base)
      if (seen === undefined || score > seen) {
        scores.set(base, score)
      }
    }
  }
  return scores
}

function reduce(scores: readonly number[], stat: Exclude<TrackStat, 'count'>) {
  return stat === 'max'
    ? Math.max(...scores)
    : stat === 'min'
      ? Math.min(...scores)
      : scores.reduce((sum, s) => sum + s, 0) / scores.length
}

/**
 * One value per transcript residue: `stat` over the scores on the bases of its
 * codon. A residue none of whose bases has a score has no value.
 */
export function scoreByResidue(
  p2gCodon: Record<number, number[]>,
  baseScores: ReadonlyMap<number, number>,
  stat: Exclude<TrackStat, 'count'>,
) {
  const byPosition = new Map<number, number>()
  for (const [pos, bases] of Object.entries(p2gCodon)) {
    const scores = bases.flatMap(base => baseScores.get(base) ?? [])
    if (scores.length > 0) {
      byPosition.set(Number(pos), reduce(scores, stat))
    }
  }
  return byPosition
}

/**
 * How many intervals fall on each transcript residue's codon, 0 where none
 * does. An interval counts once on every residue whose codon it touches: a
 * deletion across a codon boundary changes both residues, and one touching
 * two bases of a codon is still one feature.
 */
export function countByResidue(
  intervals: readonly Interval[],
  p2gCodon: Record<number, number[]>,
) {
  const residueOfBase = new Map<number, number>()
  const counts = new Map<number, number>()
  for (const [pos, bases] of Object.entries(p2gCodon)) {
    counts.set(Number(pos), 0)
    for (const base of bases) {
      residueOfBase.set(base, Number(pos))
    }
  }
  const sorted = [...residueOfBase.keys()].toSorted((a, b) => a - b)
  for (const { start, end } of intervals) {
    const touched = new Set<number>()
    for (
      let i = lowerBound(sorted, start);
      i < sorted.length && sorted[i]! < end;
      i++
    ) {
      touched.add(residueOfBase.get(sorted[i]!)!)
    }
    for (const pos of touched) {
      counts.set(pos, counts.get(pos)! + 1)
    }
  }
  return counts
}
