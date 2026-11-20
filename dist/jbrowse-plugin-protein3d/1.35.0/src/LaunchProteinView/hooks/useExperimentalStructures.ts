import { fetchExperimentalStructures } from 'p2s_mapper'
import useSWR from 'swr'

import { STATIC_SWR_OPTIONS } from './swrOptions'

// An accession with no experimental structure, the ordinary case for most
// genes, answers an empty list rather than an error.
export default function useExperimentalStructures(
  uniprotId: string | undefined,
) {
  const { data, error, isLoading } = useSWR(
    uniprotId ? (['experimental-structures', uniprotId] as const) : null,
    ([, id]) => fetchExperimentalStructures(id),
    STATIC_SWR_OPTIONS,
  )
  return { entries: data, error, isLoading }
}
