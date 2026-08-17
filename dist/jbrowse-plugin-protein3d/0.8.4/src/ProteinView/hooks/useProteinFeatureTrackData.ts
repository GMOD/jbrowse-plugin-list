import { useMemo } from 'react'

import { alignmentLength } from '../../mappings'
import { CHAR_WIDTH } from '../constants'
import useUniProtFeatures from './useUniProtFeatures'

import type { UniProtFeature } from './useUniProtFeatures'
import type { JBrowsePluginProteinStructureModel } from '../model'
import type { MapUniProtPosition } from '../pdbUniProtMapping'

export interface FeatureLayout {
  feature: UniProtFeature
  /** 0-based half-open structure-residue range the feature covers */
  structureStart: number
  structureEnd: number
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
 * Places a UniProt feature: its 1-based inclusive UniProt range becomes a
 * 0-based half-open structure range (identity for AlphaFold, SIFTS-offset for
 * PDB — see useStructureUniProt), then alignment columns and pixel geometry.
 * This is the only UniProt->structure coordinate conversion in the tracks; every
 * consumer reads `structureStart`/`structureEnd` off the layout.
 *
 * Returns undefined when either endpoint falls outside the structure or has no
 * alignment column, so an unmappable feature is dropped rather than drawn at a
 * misleading position.
 */
export function layoutFeature(
  feature: UniProtFeature,
  structurePositionToAlignmentMap: Record<number, number>,
  mapUniProtPosition: MapUniProtPosition,
): FeatureLayout | undefined {
  const structureStart = mapUniProtPosition(feature.start)
  const structureLast = mapUniProtPosition(feature.end)
  if (structureStart === undefined || structureLast === undefined) {
    return undefined
  }
  const alignmentStart = structurePositionToAlignmentMap[structureStart]
  const alignmentEnd = structurePositionToAlignmentMap[structureLast]
  return alignmentStart === undefined || alignmentEnd === undefined
    ? undefined
    : {
        feature,
        structureStart,
        structureEnd: structureLast + 1,
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
  mapUniProtPosition: MapUniProtPosition,
): {
  data: FeatureTrackData | undefined
  isLoading: boolean
  error: unknown
} {
  const { features, isLoading, error } = useUniProtFeatures(uniprotId)
  const {
    pairwiseAlignment,
    hiddenFeatureTypes,
    structurePositionToAlignmentMap,
  } = model

  const data = useMemo(() => {
    if (!features || !pairwiseAlignment || !structurePositionToAlignmentMap) {
      return undefined
    }
    const groups = new Map<string, FeatureLayout[]>()
    for (const feature of features) {
      if (!hiddenFeatureTypes.has(feature.type)) {
        const layout = layoutFeature(
          feature,
          structurePositionToAlignmentMap,
          mapUniProtPosition,
        )
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
      sequenceLength: alignmentLength(pairwiseAlignment),
    }
  }, [
    features,
    pairwiseAlignment,
    hiddenFeatureTypes,
    structurePositionToAlignmentMap,
    mapUniProtPosition,
  ])

  return { data, isLoading, error }
}
