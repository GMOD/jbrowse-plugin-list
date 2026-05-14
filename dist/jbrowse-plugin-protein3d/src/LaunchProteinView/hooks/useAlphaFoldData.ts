import { useState } from 'react'

import useAlphaFoldUrl from './useAlphaFoldUrl'
import useRemoteStructureFileSequence from './useRemoteStructureFileSequence'
import {
  getAlphaFoldConfidenceUrl,
  getAlphaFoldStructureUrl,
} from '../utils/launchViewUtils'

export default function useAlphaFoldData({
  uniprotId,
  useApiSearch = false,
}: {
  uniprotId?: string
  useApiSearch?: boolean
}) {
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(0)

  const hardcodedUrl = uniprotId
    ? getAlphaFoldStructureUrl(uniprotId)
    : undefined
  const hardcodedConfidenceUrl = uniprotId
    ? getAlphaFoldConfidenceUrl(uniprotId)
    : undefined

  // Optionally fetch from API for isoform search
  const {
    predictions,
    isLoading: isApiLoading,
    error: apiError,
  } = useAlphaFoldUrl({ uniprotId: useApiSearch ? uniprotId : undefined })

  const selectedPrediction = predictions?.[selectedEntryIndex]

  const url = useApiSearch ? selectedPrediction?.cifUrl : hardcodedUrl
  const confidenceUrl =
    selectedPrediction?.plddtDocUrl ?? hardcodedConfidenceUrl

  // Always fetch sequence from structure file
  const {
    sequences,
    isLoading: isSequenceLoading,
    error: sequenceError,
  } = useRemoteStructureFileSequence({ url })

  const structureSequence = sequences?.[0]

  const isLoading = isApiLoading || isSequenceLoading
  const error = apiError ?? sequenceError

  return {
    predictions,
    isLoading,
    error,
    selectedEntryIndex,
    setSelectedEntryIndex,
    selectedPrediction,
    url,
    confidenceUrl,
    structureSequence,
  }
}
