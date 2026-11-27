import { appendEdit } from './walkLanes.ts'

import type { PairChain, PairEdit } from '@gmod/gbz-base/pairAlignment'
import type { WalkFragment, WalkNode } from '@gmod/gfa-tabix'

interface Place {
  start: number
  end: number
  reversed: boolean
}

interface Span {
  start: number
  end: number
}

interface Run {
  first: number
  last: number
  firstRef: Place
  lastRef: Place
  matches: number[]
  inserted: number[]
  deleted: number[]
}

/**
 * A stretch of a haplotype on reference its lane walks in an order the walk
 * file's placement does not settle: the haplotype's extent, the reference
 * between its lowest and highest stored place, and no alignment.
 * `hapWalks` and `refWalks` are how many times the haplotype's steps and the
 * reference pass the nodes it holds, on average over their bases.
 */
export interface ArrayRecord {
  queryStart: number
  queryEnd: number
  targetStart: number
  targetEnd: number
  strand: '+' | '-'
  placedBp: number
  againstBp: number
  hapWalks: number
  refWalks: number
}

function stepOffsets(nodes: Map<number, WalkNode>, ids: Int32Array) {
  const at = new Float64Array(ids.length + 1)
  for (let i = 0; i < ids.length; i++) {
    const node = nodes.get(ids[i]!)
    at[i + 1] = at[i]! + (node === undefined ? 0 : node.end - node.start)
  }
  return at
}

function placeOf(fragment: WalkFragment, hapAt: Float64Array, i: number) {
  const start = fragment.refStarts[i]!
  return Number.isNaN(start)
    ? undefined
    : {
        start,
        end: start + hapAt[i + 1]! - hapAt[i]!,
        reversed: fragment.against[i] === 1,
      }
}

function follows(last: Place, next: Place) {
  return (
    last.reversed === next.reversed &&
    (next.reversed ? next.end <= last.start : next.start >= last.end)
  )
}

function runEdits({ firstRef, matches, inserted, deleted }: Run) {
  const edits: PairEdit[] = []
  const n = matches.length
  for (let k = 0; k < n; k++) {
    const i = firstRef.reversed ? n - 1 - k : k
    const gap = firstRef.reversed ? i + 1 : i
    if (k > 0) {
      appendEdit(edits, 'I', inserted[gap]!)
      appendEdit(edits, 'D', deleted[gap]!)
    }
    appendEdit(edits, '=', matches[i]!)
  }
  return edits
}

function readSteps(
  fragment: WalkFragment,
  hapAt: Float64Array,
  from: number,
  to: number,
) {
  const records: PairChain[] = []
  let run: Run | undefined
  const close = () => {
    if (run?.matches.some(bp => bp > 0)) {
      const { first, last, firstRef, lastRef, matches } = run
      records.push({
        queryStart: hapAt[first]!,
        queryEnd: hapAt[last + 1]!,
        targetStart: firstRef.reversed ? lastRef.start : firstRef.start,
        targetEnd: firstRef.reversed ? firstRef.end : lastRef.end,
        strand: firstRef.reversed ? '-' : '+',
        edits: runEdits(run),
        sharedBases: matches.reduce((sum, bp) => sum + bp, 0),
      })
    }
  }
  for (let i = from; i < to; i++) {
    const place = placeOf(fragment, hapAt, i)
    if (place !== undefined) {
      if (run !== undefined && follows(run.lastRef, place)) {
        run.inserted.push(hapAt[i]! - hapAt[run.last + 1]!)
        run.deleted.push(
          place.reversed
            ? run.lastRef.start - place.end
            : place.start - run.lastRef.end,
        )
        run.matches.push(place.end - place.start)
        run.last = i
        run.lastRef = place
      } else {
        close()
        run = {
          first: i,
          last: i,
          firstRef: place,
          lastRef: place,
          matches: [place.end - place.start],
          inserted: [0],
          deleted: [0],
        }
      }
    }
  }
  close()
  return records
}

/**
 * A haplotype fragment's records against the reference, read from the place
 * the walk file gives each of its steps, with no alignment. A record is a
 * maximal run of steps on the reference that all run with it, or all against
 * it, each placed at or past the end of the one before in that direction: own
 * steps between two of them are an insertion and the reference between their
 * places a deletion. A step that turns, or lands on reference the run has
 * already passed, starts the next record, and own steps between two records
 * are under neither.
 */
export function placementRecords(nodes: Map<number, WalkNode>) {
  return (fragment: WalkFragment) =>
    readSteps(
      fragment,
      stepOffsets(nodes, fragment.ids),
      0,
      fragment.ids.length,
    )
}

/**
 * Where `placementRecords` starts a record beside a node the reference passes
 * more than once, so the walk file's placement rule, not the walk, chose the
 * pass: the reference from the lower of the two steps' places to the higher
 */
export function pickBreaks(nodes: Map<number, WalkNode>) {
  const manyPasses = (id: number) => (nodes.get(id)?.passes ?? 0) > 1
  return (fragment: WalkFragment) => {
    const { ids } = fragment
    const hapAt = stepOffsets(nodes, ids)
    const spans: Span[] = []
    let last = -1
    let lastPlace: Place | undefined
    for (let i = 0; i < ids.length; i++) {
      const place = placeOf(fragment, hapAt, i)
      if (place !== undefined) {
        if (
          lastPlace !== undefined &&
          !follows(lastPlace, place) &&
          (manyPasses(ids[last]!) || manyPasses(ids[i]!))
        ) {
          spans.push({
            start: Math.min(lastPlace.start, place.start),
            end: Math.max(lastPlace.end, place.end),
          })
        }
        last = i
        lastPlace = place
      }
    }
    return spans
  }
}

/** Spans in reference order, overlapping ones merged and touching ones not */
export function arrayStretches(spans: Span[]) {
  const sorted = spans.slice().sort((a, b) => a.start - b.start)
  const stretches: Span[] = []
  for (const { start, end } of sorted) {
    const last = stretches.at(-1)
    if (last !== undefined && start < last.end) {
      last.end = Math.max(last.end, end)
    } else {
      stretches.push({ start, end })
    }
  }
  return stretches
}

function stretchHolding(stretches: Span[], place: Span) {
  let lo = 0
  let hi = stretches.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (stretches[mid]!.start <= place.start) {
      lo = mid + 1
    } else {
      hi = mid
    }
  }
  const k = lo - 1
  return k >= 0 && place.end <= stretches[k]!.end ? k : -1
}

function arrayRecord(
  nodes: Map<number, WalkNode>,
  fragment: WalkFragment,
  hapAt: Float64Array,
  first: number,
  last: number,
) {
  let placedBp = 0
  let againstBp = 0
  let low = Infinity
  let high = -Infinity
  const lengths = new Map<number, number>()
  for (let i = first; i <= last; i++) {
    const place = placeOf(fragment, hapAt, i)
    if (place !== undefined) {
      const bp = place.end - place.start
      placedBp += bp
      againstBp += place.reversed ? bp : 0
      low = Math.min(low, place.start)
      high = Math.max(high, place.end)
      lengths.set(fragment.ids[i]!, bp)
    }
  }
  let distinct = 0
  let referenceBp = 0
  for (const [id, bp] of lengths) {
    distinct += bp
    referenceBp += bp * (nodes.get(id)?.passes ?? 0)
  }
  return {
    queryStart: hapAt[first]!,
    queryEnd: hapAt[last + 1]!,
    targetStart: low,
    targetEnd: high,
    strand: againstBp > placedBp - againstBp ? '-' : '+',
    placedBp,
    againstBp,
    hapWalks: distinct > 0 ? placedBp / distinct : 0,
    refWalks: distinct > 0 ? referenceBp / distinct : 0,
  } satisfies ArrayRecord
}

/**
 * One lane's records against the reference, from all its fragments in the
 * cut. The lane's array stretches are its pick breaks' spans merged, and in
 * each fragment a maximal run of steps on the reference whose places all lie
 * in one stretch is one `ArrayRecord`; the steps between are read by
 * `placementRecords`' rule. A lane whose steps pass no node the reference
 * passes more than once has no stretch, so each fragment reads as
 * `placementRecords` reads it.
 */
export function laneRecords(nodes: Map<number, WalkNode>) {
  const breaksOf = pickBreaks(nodes)
  return (fragments: WalkFragment[]) => {
    const stretches = arrayStretches(fragments.flatMap(breaksOf))
    return fragments.map(fragment => {
      const n = fragment.ids.length
      const hapAt = stepOffsets(nodes, fragment.ids)
      const stretchAt = (i: number) => {
        const place = placeOf(fragment, hapAt, i)
        return place === undefined
          ? undefined
          : stretchHolding(stretches, place)
      }
      const chains: PairChain[] = []
      const arrays: ArrayRecord[] = []
      const read = (from: number, to: number) => {
        for (const chain of readSteps(fragment, hapAt, from, to)) {
          chains.push(chain)
        }
      }
      let from = 0
      let i = 0
      while (i < n) {
        const k = stretchAt(i)
        if (k !== undefined && k >= 0) {
          let last = i
          let j = i + 1
          let inside = true
          while (j < n && inside) {
            const next = stretchAt(j)
            if (next === k) {
              last = j
            }
            inside = next === undefined || next === k
            j++
          }
          read(from, i)
          arrays.push(arrayRecord(nodes, fragment, hapAt, i, last))
          from = last + 1
          i = last + 1
        } else {
          i++
        }
      }
      read(from, n)
      return { fragment, chains, arrays }
    })
  }
}
