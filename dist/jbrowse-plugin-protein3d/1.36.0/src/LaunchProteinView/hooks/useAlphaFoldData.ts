import { useMemo } from 'react'

import { fetchAlphaFoldModels } from 'p2s_mapper'
import useSWR from 'swr'

import { launchAlphaFoldModel } from '../resolveGeneLaunch'
import { STATIC_SWR_OPTIONS } from './swrOptions'
import useIsoformProteinSequences from './useIsoformProteinSequences'

import type { Feature } from '@jbrowse/core/util'

/**
 * The AlphaFold DB model a launch opens for this gene's accession, the
 * canonical file when the API does not answer.
 */
export default function useAlphaFoldData({
  uniprotId,
  feature,
  view,
  preferredTranscriptId,
}: {
  uniprotId?: string
  feature: Feature
  view?: { assemblyNames?: string[] }
  preferredTranscriptId?: string
}) {
  const { data, isLoading, error, mutate } = useSWR(
    uniprotId ? (['alphafold-models', uniprotId] as const) : null,
    ([, id]) => fetchAlphaFoldModels(id),
    STATIC_SWR_OPTIONS,
  )
  const { isoformSequences } = useIsoformProteinSequences({ feature, view })
  const model = useMemo(
    () =>
      uniprotId && (data || error)
        ? launchAlphaFoldModel(
            uniprotId,
            data,
            isoformSequences,
            preferredTranscriptId,
          )
        : undefined,
    [uniprotId, data, error, isoformSequences, preferredTranscriptId],
  )
  const modelsUnreachable: unknown = error
  const entry = uniprotId?.replace(/-\d+$/, '')
  return {
    isLoading,
    modelsUnreachable,
    model,
    /** the length of the entry's own sequence, which PDB entries number on */
    entryLength: data?.find(m => m.accession === entry)?.sequence.length,
    noModel: data?.length === 0,
    retry: () => {
      void mutate()
    },
  }
}
