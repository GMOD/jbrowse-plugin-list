import useSWR from 'swr'

import { fetchProteinSeq } from '../utils/calculateProteinSequence'
import { getTranscriptFeatures } from '../utils/util'

import type { Feature } from '@jbrowse/core/util'

export default function useIsoformProteinSequences({
  feature,
  view,
}: {
  feature: Feature
  view?: { assemblyNames?: string[] }
}) {
  const { data, error, isLoading } = useSWR<
    Record<string, { feature: Feature; seq: string }>
  >(
    ['isoform-sequences', feature.id(), view?.assemblyNames?.[0]],
    async () => {
      const transcripts = getTranscriptFeatures(feature)
      const results = await Promise.all(
        transcripts.map(async f => {
          try {
            const seq = await fetchProteinSeq({ view, feature: f })
            return seq ? ([f.id(), { feature: f, seq }] as const) : undefined
          } catch (e) {
            console.error('[useIsoformProteinSequences] error for', f.id(), e)
            return undefined
          }
        }),
      )
      return Object.fromEntries(results.filter(r => r !== undefined))
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      keepPreviousData: true,
    },
  )

  return { isLoading, isoformSequences: data, error }
}
