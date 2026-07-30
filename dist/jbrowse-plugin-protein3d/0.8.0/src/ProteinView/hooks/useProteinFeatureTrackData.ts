import { useMemo } from 'react'

import { CHAR_WIDTH } from '../constants'
import useUniProtFeatures from './useUniProtFeatures'

import type { UniProtFeature } from './useUniProtFeatures'
import type { JBrowsePluginProteinStructureModel } from '../model'

export interface FeatureLayout {
  feature: UniProtFeature
  alignmentStart: number
  alignmentEnd: number
  left: number
  width: number
  lane: number
}

export interface FeatureGroup {
  type: string
  layouts: FeatureLayout[]
  laneCount: number
}

export interface FeatureTrackData {
  visibleGroups: FeatureGroup[]
  sequenceLength: number
}

/**
 * UniProt feature coords are 1-based inclusive; the structure/click/highlight
 * pipeline works in 0-based half-open ranges. Doing the conversion in one named
 * place keeps the off-by-one out of every call site.
 */
export function oneBasedUniProtFeatureToStructureRange(feature: {
  start: number
  end: number
}) {
  return { start: feature.start - 1, end: feature.end }
}

/**
 * Maps a feature's structure range onto alignment columns and pixel geometry.
 * Returns undefined when either endpoint has no alignment column, so unmappable
 * features aren't drawn at a misleading position.
 */
function layoutFeature(
  feature: UniProtFeature,
  structurePositionToAlignmentMap: Record<number, number>,
): FeatureLayout | undefined {
  const alignmentStart = structurePositionToAlignmentMap[feature.start - 1]
  const alignmentEnd = structurePositionToAlignmentMap[feature.end - 1]
  return alignmentStart === undefined || alignmentEnd === undefined
    ? undefined
    : {
        feature,
        alignmentStart,
        alignmentEnd,
        left: alignmentStart * CHAR_WIDTH,
        width: Math.max((alignmentEnd - alignmentStart + 1) * CHAR_WIDTH, 3),
        lane: 0,
      }
}

/**
 * Greedy interval packing: assigns each feature the first lane whose last
 * feature ends before this one starts, so overlapping features of the same type
 * stack instead of hiding each other. Mutates each layout's lane and returns the
 * lane count (at least 1).
 */
export function packLanes(layouts: FeatureLayout[]): number {
  const laneEnds: number[] = []
  const sorted = [...layouts].sort(
    (a, b) => a.alignmentStart - b.alignmentStart,
  )
  for (const layout of sorted) {
    const free = laneEnds.findIndex(end => end < layout.alignmentStart)
    if (free === -1) {
      layout.lane = laneEnds.length
      laneEnds.push(layout.alignmentEnd)
    } else {
      layout.lane = free
      laneEnds[free] = layout.alignmentEnd
    }
  }
  return Math.max(laneEnds.length, 1)
}

export default function useProteinFeatureTrackData(
  model: JBrowsePluginProteinStructureModel,
  uniprotId: string | undefined,
): {
  data: FeatureTrackData | undefined
  isLoading: boolean
  error: unknown
} {
  const { features, isLoading, error } = useUniProtFeatures(uniprotId)
  const { pairwiseAlignment, hiddenFeatureTypes, structurePositionToAlignmentMap } =
    model

  const data = useMemo(() => {
    if (!features || !pairwiseAlignment || !structurePositionToAlignmentMap) {
      return undefined
    }
    const groups = new Map<string, FeatureLayout[]>()
    for (const feature of features) {
      if (!hiddenFeatureTypes.has(feature.type)) {
        const layout = layoutFeature(feature, structurePositionToAlignmentMap)
        if (layout) {
          const list = groups.get(feature.type)
          if (list) {
            list.push(layout)
          } else {
            groups.set(feature.type, [layout])
          }
        }
      }
    }
    const visibleGroups = [...groups].map(([type, layouts]) => ({
      type,
      layouts,
      laneCount: packLanes(layouts),
    }))
    return {
      visibleGroups,
      sequenceLength: pairwiseAlignment.alns[0].seq.length,
    }
  }, [
    features,
    pairwiseAlignment,
    hiddenFeatureTypes,
    structurePositionToAlignmentMap,
  ])

  return { data, isLoading, error }
}
