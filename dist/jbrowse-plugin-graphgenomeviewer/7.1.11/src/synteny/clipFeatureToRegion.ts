import {
  clipSyntenyFeature,
  getAlignmentOps,
  splitSyntenyFeatureAtGaps,
} from '@jbrowse/synteny-core'

import SyntenyFeature from './SyntenyFeature.ts'

import type { Feature, SimpleFeatureSerialized } from '@jbrowse/core/util'

interface Interval {
  start: number
  end: number
}

interface ClippedIntervals extends Interval {
  mateStart: number
  mateEnd: number
  cigar?: Uint32Array
}

const ALIGNMENT_STRING_FIELDS = ['CIGAR', 'cs', 'coarseCigar', 'cg', 'cr']

type SerializedMate = NonNullable<SimpleFeatureSerialized['mate']>

function isMate(mate: unknown): mate is SerializedMate {
  return (
    typeof mate === 'object' &&
    mate !== null &&
    'refName' in mate &&
    'start' in mate &&
    'end' in mate &&
    typeof mate.refName === 'string' &&
    typeof mate.start === 'number' &&
    typeof mate.end === 'number'
  )
}

function mateOf(feature: Feature) {
  const mate: unknown = feature.get('mate')
  return isMate(mate) ? mate : undefined
}

// A record with no alignment string maps its two intervals onto each other in
// proportion, the way the synteny launch interpolates across such a block; a
// reverse-strand record runs its mate from the far end.
function interpolateClip(
  own: Interval,
  mate: Interval,
  strand: number,
  window: Interval,
): ClippedIntervals | undefined {
  const lo = Math.max(own.start, window.start)
  const hi = Math.min(own.end, window.end)
  const ratio = (mate.end - mate.start) / Math.max(own.end - own.start, 1)
  const mateAt = (q: number) =>
    strand === -1
      ? mate.end - (q - own.start) * ratio
      : mate.start + (q - own.start) * ratio
  const a = Math.round(mateAt(lo))
  const b = Math.round(mateAt(hi))
  return hi > lo
    ? { start: lo, end: hi, mateStart: Math.min(a, b), mateEnd: Math.max(a, b) }
    : undefined
}

// A record inside the window is its own clip, and skips parsing its alignment
// string, unless the runs or the ops are wanted, which only the string knows.
function clipIntervals(
  feature: Feature,
  mate: Interval,
  window: Interval,
  splitAtGapBp: number | undefined,
  keepAlignment: boolean,
): ClippedIntervals[] {
  const own = { start: feature.get('start'), end: feature.get('end') }
  const strand = feature.get('strand') === -1 ? -1 : 1
  const inside = own.start >= window.start && own.end <= window.end
  const ops =
    inside && splitAtGapBp === undefined && !keepAlignment
      ? undefined
      : getAlignmentOps(feature)
  if (ops === undefined) {
    const clipped = inside
      ? { ...own, mateStart: mate.start, mateEnd: mate.end }
      : interpolateClip(own, mate, strand, window)
    return clipped === undefined ? [] : [clipped]
  } else {
    const runs =
      splitAtGapBp === undefined
        ? [{ ...own, mateStart: mate.start, mateEnd: mate.end, cigar: ops }]
        : splitSyntenyFeatureAtGaps(
            ops,
            own.start,
            mate.start,
            mate.end,
            strand,
            splitAtGapBp,
          )
    return runs.flatMap(run => {
      const clipped = clipSyntenyFeature(
        run.cigar,
        run.start,
        run.mateStart,
        run.mateEnd,
        strand,
        window.start,
        window.end,
      )
      return clipped === undefined ? [] : [clipped]
    })
  }
}

function clippedFeature(
  feature: Feature,
  mate: SerializedMate,
  clipped: ClippedIntervals,
  window: Interval,
  run: string,
  keepAlignment: boolean,
) {
  const suffix = `:${window.start}-${window.end}${run}`
  const source = feature.toJSON()
  const data: SimpleFeatureSerialized = {
    ...source,
    uniqueId: `${feature.id()}${suffix}`,
    start: clipped.start,
    end: clipped.end,
    mate: { ...mate, start: clipped.mateStart, end: clipped.mateEnd },
  }
  if (source.syntenyId !== undefined) {
    data.syntenyId = `${String(source.syntenyId)}${suffix}`
  }
  for (const field of ALIGNMENT_STRING_FIELDS) {
    delete data[field]
  }
  if (keepAlignment && clipped.cigar) {
    data.alignmentOps = clipped.cigar
  }
  return new SyntenyFeature(data)
}

/**
 * The pieces of one pairwise record inside `window`, on both axes: none when
 * the record misses the window, one otherwise, and with `splitAtGapBp` one per
 * gap-free run of its alignment, numbered after the window suffix so each run
 * is its own feature and its own `syntenyId` group. A piece keeps every field
 * of the record except the alignment strings; `keepAlignment` hands back its
 * own stretch of them as packed ops in `alignmentOps`. A feature with no
 * `mate` is not a pairwise record and passes through whole.
 *
 * A copy of `@jbrowse/plugin-comparative-adapters`' own, which a runtime plugin
 * cannot import: the worker serves that package as a stub too.
 */
export function clipFeatureToRegion(
  feature: Feature,
  window: Interval,
  splitAtGapBp?: number,
  keepAlignment = false,
): Feature[] {
  const mate = mateOf(feature)
  if (mate === undefined) {
    return [feature]
  } else {
    const pieces = clipIntervals(
      feature,
      mate,
      window,
      splitAtGapBp,
      keepAlignment,
    )
    return pieces.map((piece, i) =>
      clippedFeature(
        feature,
        mate,
        piece,
        window,
        pieces.length > 1 ? `/${i}` : '',
        keepAlignment,
      ),
    )
  }
}
