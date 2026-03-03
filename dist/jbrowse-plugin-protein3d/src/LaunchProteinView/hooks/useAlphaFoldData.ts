import { useEffect, useMemo, useState } from 'react'

import useAlphaFoldUrl from './useAlphaFoldUrl'
import useRemoteStructureFileSequence from './useRemoteStructureFileSequence'
import { getAlphaFoldStructureUrl } from '../utils/launchViewUtils'

/**
 * Custom hook to manage AlphaFold predictions and selected entry
 */
export default function useAlphaFoldData({
  uniprotId,
  useApiSearch = false,
}: {
  uniprotId?: string
  useApiSearch?: boolean
}) {
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number>(0)

  const hardcodedUrl = useMemo(
    () => (uniprotId ? getAlphaFoldStructureUrl(uniprotId) : undefined),
    [uniprotId],
  )

  // Optionally fetch from API for isoform search
  const {
    predictions,
    isLoading: isApiLoading,
    error: apiError,
  } = useAlphaFoldUrl({ uniprotId: useApiSearch ? uniprotId : undefined })

  // Auto-select first AlphaFold entry when predictions load
  useEffect(() => {
    if (predictions && predictions.length > 0) {
      setSelectedEntryIndex(0)
    }
  }, [predictions])

  const selectedPrediction = predictions?.[selectedEntryIndex]

  // When using API, use the selected prediction's URL
  // Otherwise, use the hardcoded URL
  const url = useApiSearch ? selectedPrediction?.cifUrl : hardcodedUrl
  const confidenceUrl = selectedPrediction?.plddtDocUrl

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
