import useStructureFileSequence from './useStructureFileSequence'
import {
  getAlphaFoldConfidenceUrl,
  getAlphaFoldStructureUrl,
} from '../utils/launchViewUtils'

export default function useAlphaFoldData({
  uniprotId,
}: {
  uniprotId?: string
}) {
  const url = uniprotId ? getAlphaFoldStructureUrl(uniprotId) : undefined
  const confidenceUrl = uniprotId
    ? getAlphaFoldConfidenceUrl(uniprotId)
    : undefined

  const { sequences, isLoading, isValidating, error } =
    useStructureFileSequence({ url })

  return {
    isLoading,
    isValidating,
    error,
    url,
    confidenceUrl,
    structureSequence: sequences?.[0],
  }
}
