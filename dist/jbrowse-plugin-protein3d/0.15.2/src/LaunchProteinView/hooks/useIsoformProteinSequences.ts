import { getSession } from '@jbrowse/core/util'
import useSWR from 'swr'

import { STATIC_SWR_OPTIONS } from './swrOptions'
import { codingTranscripts } from '../codingFeature'
import { fetchTranscriptProteinSeqs } from '../utils/translateTranscripts'

import type { IsoformSequences } from '../utils/util'
import type { Feature } from '@jbrowse/core/util'

interface IsoformTranslations {
  sequences: IsoformSequences
  translated: number
  total: number
}

export default function useIsoformProteinSequences({
  feature,
  view,
}: {
  feature: Feature
  view?: { assemblyNames?: string[] }
}) {
  const { data, error, isLoading } = useSWR<IsoformTranslations>(
    ['isoform-sequences', feature.id(), view?.assemblyNames?.[0]],
    async () => {
      const transcripts = codingTranscripts(feature)
      const results = await fetchTranscriptProteinSeqs({
        transcripts,
        session: getSession(view),
        assemblyName: view?.assemblyNames?.[0],
      })
      for (const { feature: f, error: e } of results) {
        if (e !== undefined) {
          console.error('[useIsoformProteinSequences] error for', f.id(), e)
        }
      }
      const entries = results.flatMap(r =>
        r.seq === undefined
          ? []
          : [[r.feature.id(), { feature: r.feature, seq: r.seq }] as const],
      )
      return {
        sequences: Object.fromEntries(entries),
        translated: entries.length,
        total: results.length,
      }
    },
    {
      ...STATIC_SWR_OPTIONS,
      keepPreviousData: true,
    },
  )

  // A transcript without a sequence is reported rather than dropped: silently
  // listing 18 of 20 isoforms reads as a gene with 18 isoforms. It covers both
  // a translation that threw and a transcript with no CDS to translate, which
  // is why the wording does not claim a failure.
  const missing = data ? data.total - data.translated : 0
  return {
    isLoading,
    isoformSequences: data?.sequences,
    error,
    partialFailure:
      missing > 0 && data
        ? `${missing} of ${data.total} transcripts have no protein sequence`
        : undefined,
  }
}
