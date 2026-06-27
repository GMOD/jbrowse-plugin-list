import useUniProtFeatures from './useUniProtFeatures'

import type { UniProtFeature } from './useUniProtFeatures'
import type { JBrowsePluginProteinStructureModel } from '../model'

type FeaturesByType = Record<string, UniProtFeature[]>

export interface FeatureTrackData {
  featureTypes: string[]
  visibleTypes: string[]
  groupedFeatures: FeaturesByType
  sequenceLength: number
}

function groupFeaturesByType(features: UniProtFeature[]): FeaturesByType {
  const grouped: FeaturesByType = {}
  for (const feature of features) {
    grouped[feature.type] ??= []
    grouped[feature.type]!.push(feature)
  }
  return grouped
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
  const { pairwiseAlignment, hiddenFeatureTypes } = model

  if (!uniprotId || isLoading || error || !features || !pairwiseAlignment) {
    return { data: undefined, isLoading, error }
  }

  const sequenceLength = pairwiseAlignment.alns[0].seq.length
  const groupedFeatures = groupFeaturesByType(features)
  const featureTypes = Object.keys(groupedFeatures)
  const visibleTypes = featureTypes.filter(
    type => !hiddenFeatureTypes.has(type),
  )

  return {
    data: { featureTypes, visibleTypes, groupedFeatures, sequenceLength },
    isLoading: false,
    error: undefined,
  }
}
