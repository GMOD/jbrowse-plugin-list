import { useState } from 'react'

import useAlphaFoldData from './useAlphaFoldData'
import useAlphaFoldSequenceSearch from './useAlphaFoldSequenceSearch'
import useDebouncedValue from './useDebouncedValue'
import useTranscriptIsoformSelection from './useTranscriptIsoformSelection'
import useUniProtSearch from './useUniProtSearch'
import getSearchDescription from '../utils/getSearchDescription'
import { extractFeatureIdentifiers, stripStopCodon } from '../utils/util'

import type { SequenceSearchType } from './useAlphaFoldSequenceSearch'
import type { LookupMode } from '../components/UniProtIdInput'
import type { Feature } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

export default function useAlphaFoldDBSearch({
  feature,
  view,
}: {
  feature: Feature
  view: LinearGenomeViewModel
}) {
  const [lookupMode, setLookupMode] = useState<LookupMode>('auto')
  const [manualUniprotId, setManualUniprotId] = useState('')
  const geneIds = extractFeatureIdentifiers(feature)
  const [selectedQueryId, setSelectedQueryId] = useState('auto')
  const [sequenceSearchType, setSequenceSearchType] =
    useState<SequenceSearchType>('md5')
  const [selectedUniprotId, setSelectedUniprotId] = useState<string>()

  const featureUniprotId = geneIds.uniprotId

  const effectiveLookupMode =
    lookupMode === 'auto' && featureUniprotId ? 'feature' : lookupMode
  const isSequenceMode = effectiveLookupMode === 'sequence'
  const isAutoMode = effectiveLookupMode === 'auto'

  const {
    entries: uniprotEntries,
    isLoading: isLookupLoading,
    error: lookupError,
  } = useUniProtSearch({
    recognizedIds: geneIds.recognizedIds,
    geneId: geneIds.geneId,
    geneName: geneIds.geneName,
    selectedQueryId,
    enabled: isAutoMode,
  })

  // Debounce manual entry so fetches don't fire on every keystroke and
  // pollute the SWR cache with partial-ID 404s.
  const debouncedManualUniprotId = useDebouncedValue(manualUniprotId, 400)

  const autoUniprotId = uniprotEntries[0]?.accession
  const uniprotId =
    effectiveLookupMode === 'feature'
      ? featureUniprotId
      : isAutoMode
        ? (selectedUniprotId ?? autoUniprotId)
        : effectiveLookupMode === 'manual'
          ? debouncedManualUniprotId
          : undefined

  const {
    isLoading: isAlphaFoldLoading,
    error: alphaFoldError,
    url: alphaFoldUrl,
    confidenceUrl: alphaFoldConfidenceUrl,
    structureSequence: alphaFoldStructureSequence,
  } = useAlphaFoldData({
    uniprotId: isSequenceMode ? undefined : uniprotId,
  })

  const {
    transcripts: transcriptOptions,
    isoformSequences,
    isLoading: isIsoformLoading,
    error: isoformError,
    selectedTranscriptId: effectiveTranscriptId,
    setSelectedTranscriptId: setUserSelection,
    selectedTranscript,
    selectedIsoform: userSelectedProteinSequence,
  } = useTranscriptIsoformSelection({
    feature,
    view,
    structureSequence: alphaFoldStructureSequence,
    resetKey: uniprotId,
  })

  const {
    uniprotId: seqSearchUniprotId,
    cifUrl: seqSearchUrl,
    plddtDocUrl: seqSearchConfidenceUrl,
    structureSequence: seqSearchStructureSequence,
    isLoading: isSequenceSearchLoading,
    error: sequenceSearchError,
  } = useAlphaFoldSequenceSearch({
    sequence: userSelectedProteinSequence?.seq,
    searchType: sequenceSearchType,
    enabled: isSequenceMode,
  })

  // Merge alphafold / sequence-search results
  const finalUrl = isSequenceMode ? seqSearchUrl : alphaFoldUrl
  const finalConfidenceUrl = isSequenceMode
    ? seqSearchConfidenceUrl
    : alphaFoldConfidenceUrl
  const finalStructureSequence = isSequenceMode
    ? seqSearchStructureSequence
    : alphaFoldStructureSequence
  const finalUniprotId = isSequenceMode ? seqSearchUniprotId : uniprotId

  const loadingStatuses = [
    isLookupLoading && 'Looking up UniProt ID',
    isIsoformLoading && 'Loading protein sequences from transcript isoforms',
    !isSequenceMode && isAlphaFoldLoading && 'Fetching AlphaFold structure URL',
    isSequenceMode &&
      isSequenceSearchLoading &&
      'Searching AlphaFoldDB by sequence',
  ].filter((s): s is string => !!s)
  const isLoading = loadingStatuses.length > 0

  // Only show errors once all loading is done — the synchronous
  // effectiveLookupMode and autoTranscriptId computations prevent the
  // one-frame gaps that previously caused brief error flashes
  const rawError =
    isoformError ?? lookupError ?? alphaFoldError ?? sequenceSearchError
  const error = isLoading ? undefined : rawError

  return {
    lookupMode: effectiveLookupMode,
    setLookupMode,
    manualUniprotId,
    setManualUniprotId,
    selectedQueryId,
    setSelectedQueryId,
    sequenceSearchType,
    setSequenceSearchType,
    selectedUniprotId,
    setSelectedUniprotId,
    userSelection: effectiveTranscriptId,
    setUserSelection,

    transcriptOptions,
    selectedTranscript,
    isoformSequences,
    userSelectedProteinSequence,
    uniprotEntries,

    recognizedIds: geneIds.recognizedIds,
    geneName: geneIds.geneName,
    featureUniprotId,

    uniprotId: finalUniprotId,
    url: finalUrl,
    confidenceUrl: finalConfidenceUrl,
    structureSequence: finalStructureSequence,

    error,
    loadingStatuses,
    isSequenceSearchLoading,

    showIdentifierSelector:
      isAutoMode && (geneIds.recognizedIds.length > 0 || !!geneIds.geneName),
    showStructureSelectors:
      !!isoformSequences &&
      !!selectedTranscript &&
      (isSequenceMode || !!(finalStructureSequence && finalUniprotId)),
    sequencesMatch:
      userSelectedProteinSequence?.seq && finalStructureSequence
        ? stripStopCodon(userSelectedProteinSequence.seq) ===
          finalStructureSequence
        : undefined,

    searchDescription: getSearchDescription({
      selectedQueryId,
      recognizedIds: geneIds.recognizedIds,
      geneName: geneIds.geneName,
    }),
    searchDescriptionOr: getSearchDescription({
      selectedQueryId,
      recognizedIds: geneIds.recognizedIds,
      geneName: geneIds.geneName,
      joinWord: 'or',
    }),

    selectedTableAccession: selectedUniprotId ?? autoUniprotId,

    showUniprotResults:
      !!isoformSequences &&
      isAutoMode &&
      (uniprotEntries.length > 0 || isLookupLoading),
    showNoResults:
      !!isoformSequences &&
      isAutoMode &&
      !isLookupLoading &&
      uniprotEntries.length === 0,
    showSequenceSearchStatus: isSequenceMode,
    showAlphaFoldDBSearchStatus:
      !!finalStructureSequence && !!finalUniprotId && !isSequenceMode,
    isLoading,
  }
}
