import {
  getModPositions,
  getModProbabilityBytes,
  getModTag,
  modProbAt,
} from '@jbrowse/modifications-utils'

import { GAPS, queryIndexAt } from './readLayout'
import { rowSpan } from './tview'

import type { ReadLayout } from './readLayout'
import type { TviewPlan } from './tview'
import type { Feature } from '@jbrowse/core/util'

/**
 * The most probable call on each modified base, as parallel arrays rather than
 * one object per call to keep the worker's reply small: the row it is on, the
 * 1-based index into that row's ungapped letters, its type and its ML byte.
 */
export interface TviewModifications {
  rows: string[]
  /** the MM codes, `m`, `h`, `a` or a ChEBI number */
  types: string[]
  row: Uint32Array
  residue: Uint32Array
  type: Uint8Array
  prob: Uint8Array
  /** calls left out for being past the cap, the least probable first */
  dropped: number
  /** rows with calls whose letters are not one run of the read's sequence */
  unplaced: number
}

/**
 * Every call costs react-msaview on each load and each change of the row table,
 * with no spatial index to skip the ones off screen: over 916 rows that was
 * +90ms at 50k calls, +160ms at 100k and +415ms at 200k. A 20kb read carries
 * ~200 CpG calls at the genome's average density, so 50k is ~250 reads across
 * the widest window; 6mA called on every A does not fit.
 */
export const MAX_MODIFICATION_CALLS = 50_000

/**
 * The query index of a row's first letter, when its letters are one unbroken
 * run of the read's own sequence. They are, unless the layout moved bases of
 * the read past each other (an insertion re-filed into an array without an
 * exact rewrite) or left some out (an array block the row has no allele for),
 * and a call projected onto such a row would land on the wrong base.
 */
export function rowInRead(
  read: ReadLayout,
  row: string,
  layout: TviewPlan['layout'],
) {
  const { query } = read
  const first = query
    ? queryIndexAt(read, query, rowSpan(read, layout).from)
    : 0
  const letters = row.replaceAll(GAPS, '')
  return query?.seq.startsWith(letters, first)
    ? { seq: query.seq, first, length: letters.length }
    : undefined
}

/**
 * The most probable call at each base of `seq` in [from, from + length), packed
 * as `(type + 1) << 8 | ML byte`, 0 where nothing is called.
 */
function bestCalls(
  feature: Feature,
  mm: string,
  { seq, first: from, length }: { seq: string; first: number; length: number },
  typeIndex: (type: string) => number,
) {
  const strand = feature.get('strand') ?? 0
  const bytes = getModProbabilityBytes(feature)
  const ml = bytes ? Array.from(bytes) : undefined
  const best = new Uint16Array(length)
  for (const mod of getModPositions(mm, seq, strand, from, from + length)) {
    const tag = (typeIndex(mod.type) + 1) << 8
    const { positions, probStart, probStride } = mod
    for (const [idx, pos] of positions.entries()) {
      const at = pos - from
      const prob = modProbAt(
        ml,
        probStart,
        probStride,
        strand === -1,
        idx,
        positions.length,
      )
      const prev = best[at]
      if (prev !== undefined && (prev === 0 || (prev & 0xff) < prob)) {
        best[at] = tag | prob
      }
    }
  }
  return best
}

/**
 * The lowest probability byte whose calls all fit in `keep` together with every
 * more probable one, and how many calls of the byte below it still fit.
 */
function keepThreshold(probs: number[], keep: number) {
  const counts = new Array<number>(256).fill(0)
  for (const p of probs) {
    counts[p]!++
  }
  let threshold = 256
  let kept = 0
  while (threshold > 0 && kept + counts[threshold - 1]! <= keep) {
    threshold--
    kept += counts[threshold]!
  }
  return { threshold, room: keep - kept }
}

interface ProjectArgs {
  features: Feature[]
  plan: TviewPlan
  /** each read's rendered row, parallel to `plan.reads` */
  rows: string[]
  maxCalls?: number
}

function projectModifications(
  tags: (string | undefined)[],
  { features, plan, rows, maxCalls = MAX_MODIFICATION_CALLS }: ProjectArgs,
) {
  const rowOf = new Map(
    plan.reads.map((read, i) => [read.name, { read, row: rows[i]! }]),
  )
  const types: string[] = []
  const typeIndex = (type: string) => {
    const i = types.indexOf(type)
    return i >= 0 ? i : types.push(type) - 1
  }
  const callRows: string[] = []
  const row: number[] = []
  const residue: number[] = []
  const type: number[] = []
  const prob: number[] = []
  let unplaced = 0
  for (const [i, mm] of tags.entries()) {
    const rendered = mm ? rowOf.get(plan.featureNames[i]!) : undefined
    if (mm && rendered) {
      const slice = rowInRead(rendered.read, rendered.row, plan.layout)
      if (slice) {
        const before = row.length
        for (const [at, packed] of bestCalls(
          features[i]!,
          mm,
          slice,
          typeIndex,
        ).entries()) {
          if (packed) {
            row.push(callRows.length)
            residue.push(at + 1)
            type.push((packed >> 8) - 1)
            prob.push(packed & 0xff)
          }
        }
        if (row.length > before) {
          callRows.push(rendered.read.name)
        }
      } else {
        unplaced++
      }
    }
  }
  const { threshold, room } = keepThreshold(prob, maxCalls)
  let tiesLeft = room
  const keep = prob.map(p =>
    p >= threshold ? true : p === threshold - 1 && tiesLeft-- > 0,
  )
  const kept = (values: number[]) => values.filter((_, i) => keep[i])
  return {
    rows: callRows,
    types,
    row: Uint32Array.from(kept(row)),
    residue: Uint32Array.from(kept(residue)),
    type: Uint8Array.from(kept(type)),
    prob: Uint8Array.from(kept(prob)),
    dropped: keep.filter(k => !k).length,
    unplaced,
  }
}

/**
 * Each modified base the rendered rows show, as an index into its row's
 * letters. Undefined when no read in the window has an MM tag, so a file
 * without modifications pays for one tag lookup per read.
 */
export function planModifications(args: ProjectArgs) {
  const tags = args.features.map(f => getModTag(f))
  return tags.some(t => t !== undefined)
    ? projectModifications(tags, args)
    : undefined
}
