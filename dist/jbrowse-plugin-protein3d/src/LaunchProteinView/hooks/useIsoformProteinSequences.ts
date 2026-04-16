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
      const ret = [] as [string, { feature: Feature; seq: string }][]
      const transcripts = getTranscriptFeatures(feature)
      for (const f of transcripts) {
        try {
          const seq = await fetchProteinSeq({
            view,
            feature: f,
          })
          if (seq) {
            ret.push([f.id(), { feature: f, seq }])
          }
        } catch (e) {
          console.error('[useIsoformProteinSequences] error for', f.id(), e)
        }
      }
      return Object.fromEntries(ret)
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
