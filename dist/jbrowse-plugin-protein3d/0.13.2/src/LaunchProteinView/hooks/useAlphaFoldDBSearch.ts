import { useMemo } from 'react'

import { stripStopCodon } from 'p2s_mapper'

import useAlphaFoldData from './useAlphaFoldData'
import useTranscriptIsoformSelection from './useTranscriptIsoformSelection'

import type { UniProtIdLookup } from './useUniProtIdLookup'
import type { Feature } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

export default function useAlphaFoldDBSearch({
  feature,
  view,
  lookup,
}: {
  feature: Feature
  view: LinearGenomeViewModel
  lookup: UniProtIdLookup
}) {
  const { uniprotId, isAutoMode, isLookupLoading } = lookup

  const {
    isLoading: isAlphaFoldLoading,
    isValidating: isAlphaFoldValidating,
    error: alphaFoldError,
    model,
    noModel,
  } = useAlphaFoldData({ uniprotId, feature, view })
  // a stable array, or the isoform picker realigns on every render
  const modelSequence = model?.sequence
  const structureSequences = useMemo(
    () => (modelSequence ? [modelSequence] : undefined),
    [modelSequence],
  )

  const {
    transcripts: transcriptOptions,
    isoformSequences,
    structureSequence,
    isLoading: isIsoformLoading,
    error: isoformError,
    partialFailure: isoformPartialFailure,
    selectedTranscriptId: userSelection,
    setSelectedTranscriptId: setUserSelection,
    selectedTranscript,
    selectedIsoform: userSelectedProteinSequence,
  } = useTranscriptIsoformSelection({
    feature,
    view,
    structureSequences,
    resetKey: model?.url,
  })

  const loadingStatuses = [
    isLookupLoading && 'Looking up UniProt ID',
    isIsoformLoading && 'Loading protein sequences from transcript isoforms',
    isAlphaFoldLoading && 'Asking AlphaFold DB for models',
  ].filter(s => typeof s === 'string')
  const isLoading = loadingStatuses.length > 0

  // errors wait for loading to finish, so a lookup in flight doesn't flash one
  const rawError = isoformError ?? lookup.lookupError ?? alphaFoldError
  const error = isLoading ? undefined : rawError

  return {
    ...lookup,
    userSelection,
    setUserSelection,

    transcriptOptions,
    selectedTranscript,
    isoformSequences,
    isoformPartialFailure,
    userSelectedProteinSequence,

    url: model?.url,
    confidenceUrl: model?.confidenceUrl,
    modelAccession: model?.accession,
    structureSequence,
    noModel,

    error,
    loadingStatuses,

    // While the structure is refetched, structureSequence is still the previous
    // selection's (keepPreviousData), so a match is unknown until it settles.
    sequencesMatch:
      !isAlphaFoldValidating &&
      userSelectedProteinSequence?.seq &&
      structureSequence
        ? stripStopCodon(userSelectedProteinSequence.seq) === structureSequence
        : undefined,

    showUniprotResults:
      !!isoformSequences &&
      isAutoMode &&
      (lookup.uniprotEntries.length > 0 || isLookupLoading),
    showNoResults:
      !!isoformSequences &&
      isAutoMode &&
      !isLookupLoading &&
      lookup.uniprotEntries.length === 0,
    isLoading,
  }
}
