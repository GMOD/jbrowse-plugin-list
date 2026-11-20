import { fetchPdbEntrySummaries } from 'p2s_mapper'
import useSWR from 'swr'

import { STATIC_SWR_OPTIONS } from './swrOptions'

import type { ExperimentalStructure } from 'p2s_mapper'

/** Title, partners and ligands of every listed entry, in one request */
export default function usePdbEntrySummaries(
  entries: readonly ExperimentalStructure[] | undefined,
) {
  const ids = entries?.map(e => e.pdbId).join(',')
  const { data, error, isLoading } = useSWR(
    ids ? (['pdb-entry-summaries', ids] as const) : null,
    ([, list]) => fetchPdbEntrySummaries(list.split(',')),
    STATIC_SWR_OPTIONS,
  )
  const summariesError: unknown = error
  return { summaries: data, error: summariesError, isLoading }
}
