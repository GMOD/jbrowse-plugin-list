import { useMemo } from 'react'

import { fetchAlphaFoldModels } from 'p2s_mapper'
import useSWR from 'swr'

import { STATIC_SWR_OPTIONS } from './swrOptions'
import useIsoformProteinSequences from './useIsoformProteinSequences'
import { launchAlphaFoldModel } from '../resolveGeneLaunch'

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
  const { data, isLoading, isValidating, error } = useSWR(
    uniprotId ? (['alphafold-models', uniprotId] as const) : null,
    ([, id]) => fetchAlphaFoldModels(id),
    { ...STATIC_SWR_OPTIONS, keepPreviousData: true },
  )
  const { isoformSequences } = useIsoformProteinSequences({ feature, view })
  // keepPreviousData hands back the last accession's models after an error
  // and after the accession is cleared, when the key is null
  const model = useMemo(
    () =>
      uniprotId && (data || error)
        ? launchAlphaFoldModel(
            uniprotId,
            error ? undefined : data,
            isoformSequences,
            preferredTranscriptId,
          )
        : undefined,
    [uniprotId, data, error, isoformSequences, preferredTranscriptId],
  )
  const modelsUnreachable: unknown = uniprotId ? error : undefined
  const entry = uniprotId?.replace(/-\d+$/, '')
  return {
    isLoading,
    isValidating,
    modelsUnreachable,
    model,
    /** the length of the entry's own sequence, which PDB entries number on */
    entryLength:
      uniprotId && !error
        ? data?.find(m => m.accession === entry)?.sequence.length
        : undefined,
    noModel: !!uniprotId && !isLoading && !error && data?.length === 0,
  }
}
