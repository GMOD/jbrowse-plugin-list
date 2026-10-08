import { isRecognizedDatabaseId, searchUniProtEntries } from 'p2s_mapper'
import useSWR from 'swr'

import { STATIC_SWR_OPTIONS } from './swrOptions'

import type { UniProtSearchResult } from 'p2s_mapper'

export function partialFailureNotice({
  attemptedCount,
  failedCount,
}: UniProtSearchResult) {
  return failedCount > 0 && failedCount < attemptedCount
    ? `UniProt lookup failed for ${failedCount} of ${attemptedCount} identifiers`
    : undefined
}

export default function useUniProtSearch({
  recognizedIds = [],
  geneId,
  geneName,
  organismId,
  selectedQueryId = 'auto',
  enabled = true,
}: {
  recognizedIds?: string[]
  geneId?: string
  geneName?: string
  // NCBI taxon id scoping the gene-name query; undefined searches all species
  organismId?: number
  selectedQueryId?: string
  enabled?: boolean
}) {
  // Determine what to search based on selectedQueryId
  let idsToSearch: string[] = []
  let geneNameToSearch: string | undefined

  if (selectedQueryId === 'auto') {
    idsToSearch = recognizedIds
    geneNameToSearch = geneName
  } else if (selectedQueryId.startsWith('gene:')) {
    geneNameToSearch = selectedQueryId.replace('gene:', '')
  } else if (isRecognizedDatabaseId(selectedQueryId)) {
    idsToSearch = [selectedQueryId]
  }

  const hasValidId =
    idsToSearch.some(id => isRecognizedDatabaseId(id)) ||
    Boolean(geneNameToSearch)

  const { data, error, isLoading } = useSWR<UniProtSearchResult>(
    enabled && hasValidId
      ? [
          'uniprotSearch',
          selectedQueryId,
          idsToSearch.join(','),
          geneNameToSearch,
          geneId,
          organismId,
        ]
      : null,
    async () =>
      searchUniProtEntries({
        recognizedIds: idsToSearch,
        geneId,
        geneName: geneNameToSearch,
        organismId,
      }),
    {
      ...STATIC_SWR_OPTIONS,
      keepPreviousData: true,
    },
  )

  return {
    entries: data?.entries ?? [],
    isLoading,
    error,
    hasValidId,
    partialFailure: data ? partialFailureNotice(data) : undefined,
  }
}
