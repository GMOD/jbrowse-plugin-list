import { fetchPdbEntrySummaries } from 'p2s_mapper'
import useSWR from 'swr'

import { STATIC_SWR_OPTIONS } from './swrOptions'

/** Title, partners and ligands of every entry, in one request */
export default function usePdbEntrySummaries(
  pdbIds: readonly string[] | undefined,
) {
  const ids = pdbIds?.join(',')
  const { data, error, isLoading, mutate } = useSWR(
    ids ? (['pdb-entry-summaries', ids] as const) : null,
    ([, list]) => fetchPdbEntrySummaries(list.split(',')),
    STATIC_SWR_OPTIONS,
  )
  const summariesError: unknown = error
  return {
    summaries: data,
    error: summariesError,
    isLoading,
    retry: () => {
      void mutate()
    },
  }
}
