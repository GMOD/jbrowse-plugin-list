import useSWR from 'swr'

import { searchUniProtEntries } from '../services/lookupMethods'
import { isRecognizedDatabaseId } from '../utils/util'

import type { UniProtEntry } from '../services/lookupMethods'

export default function useUniProtSearch({
  recognizedIds = [],
  uniprotId,
  geneId,
  geneName,
  selectedQueryId = 'auto',
  enabled = true,
}: {
  recognizedIds?: string[]
  uniprotId?: string
  geneId?: string
  geneName?: string
  selectedQueryId?: string
  enabled?: boolean
}) {
  // If selected ID is a UniProt accession (prefixed with uniprot:), return it directly
  const isDirectUniProt = selectedQueryId.startsWith('uniprot:')
  const directUniProtId = isDirectUniProt
    ? selectedQueryId.replace('uniprot:', '')
    : undefined

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

  // Has valid ID if we have any recognized database IDs or a gene name
  const hasRecognizedId = idsToSearch.some(id => isRecognizedDatabaseId(id))
  const hasValidId =
    hasRecognizedId || Boolean(geneNameToSearch) || Boolean(uniprotId)

  const { data, error, isLoading } = useSWR<UniProtEntry[]>(
    enabled && hasValidId && !isDirectUniProt
      ? [
          'uniprotSearch',
          selectedQueryId,
          idsToSearch.join(','),
          geneNameToSearch,
        ]
      : null,
    async () =>
      searchUniProtEntries({
        recognizedIds: idsToSearch,
        geneId,
        geneName: geneNameToSearch,
      }),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      keepPreviousData: true,
    },
  )

  // If direct UniProt accession selected, return it as a synthetic entry
  if (isDirectUniProt && directUniProtId) {
    return {
      entries: [{ accession: directUniProtId, isReviewed: true }],
      isLoading: false,
      error: undefined,
      hasValidId: true,
    }
  }

  return {
    entries: data ?? [],
    isLoading,
    error,
    hasValidId,
  }
}
