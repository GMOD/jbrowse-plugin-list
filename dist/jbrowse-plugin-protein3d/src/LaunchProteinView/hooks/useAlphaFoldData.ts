import useRemoteStructureFileSequence from './useRemoteStructureFileSequence'
import {
  getAlphaFoldConfidenceUrl,
  getAlphaFoldStructureUrl,
} from '../utils/launchViewUtils'

export default function useAlphaFoldData({ uniprotId }: { uniprotId?: string }) {
  const url = uniprotId ? getAlphaFoldStructureUrl(uniprotId) : undefined
  const confidenceUrl = uniprotId
    ? getAlphaFoldConfidenceUrl(uniprotId)
    : undefined

  const { sequences, isLoading, error } = useRemoteStructureFileSequence({
    url,
  })

  return {
    isLoading,
    error,
    url,
    confidenceUrl,
    structureSequence: sequences?.[0],
  }
}
