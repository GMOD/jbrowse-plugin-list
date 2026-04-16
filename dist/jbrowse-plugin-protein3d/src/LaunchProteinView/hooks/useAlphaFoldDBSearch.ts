import { useEffect, useMemo, useState } from 'react'

import useAlphaFoldData from './useAlphaFoldData'
import useAlphaFoldSequenceSearch from './useAlphaFoldSequenceSearch'
import useIsoformProteinSequences from './useIsoformProteinSequences'
import useUniProtSearch from './useUniProtSearch'
import getSearchDescription from '../utils/getSearchDescription'
import {
  extractFeatureIdentifiers,
  getId,
  getTranscriptFeatures,
  getUniProtIdFromFeature,
  selectBestTranscript,
  stripStopCodon,
} from '../utils/util'

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
  const [selectedQueryId, setSelectedQueryId] = useState('auto')
  const [sequenceSearchType, setSequenceSearchType] =
    useState<SequenceSearchType>('md5')
  const [selectedUniprotId, setSelectedUniprotId] = useState<string>()
  const [userTranscriptId, setUserTranscriptId] = useState<string>()

  // Gene-level identifiers for the UniProt search
  const transcriptOptions = useMemo(
    () => getTranscriptFeatures(feature),
    [feature],
  )
  const geneIds = useMemo(() => extractFeatureIdentifiers(feature), [feature])
  const featureUniprotId = getUniProtIdFromFeature(feature)

  // Compute effective lookup mode synchronously — avoids a useEffect that
  // would leave a one-frame gap where isLoading is false but uniprotId is
  // still undefined
  const effectiveLookupMode =
    lookupMode === 'auto' && featureUniprotId ? 'feature' : lookupMode
  const isSequenceMode = effectiveLookupMode === 'sequence'
  const isAutoMode = effectiveLookupMode === 'auto'

  const {
    isoformSequences,
    isLoading: isIsoformLoading,
    error: isoformError,
  } = useIsoformProteinSequences({ feature, view })

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

  const autoUniprotId = uniprotEntries[0]?.accession
  const uniprotId =
    effectiveLookupMode === 'feature'
      ? featureUniprotId
      : isAutoMode
        ? (selectedUniprotId ?? autoUniprotId)
        : effectiveLookupMode === 'manual'
          ? manualUniprotId
          : undefined

  const {
    predictions,
    isLoading: isAlphaFoldLoading,
    error: alphaFoldError,
    selectedEntryIndex,
    setSelectedEntryIndex,
    url: alphaFoldUrl,
    confidenceUrl: alphaFoldConfidenceUrl,
    structureSequence: alphaFoldStructureSequence,
  } = useAlphaFoldData({
    uniprotId: isSequenceMode ? undefined : uniprotId,
  })

  // SYNC: src/LaunchProteinView/hooks/useTranscriptSelection.ts (same pattern)
  // Auto-select transcript synchronously — avoids a useEffect that would
  // leave a one-frame gap where isLoading is false but no transcript is
  // selected yet
  const autoTranscriptId = useMemo(() => {
    if (isoformSequences) {
      return selectBestTranscript({
        options: transcriptOptions,
        isoformSequences,
        structureSequence: alphaFoldStructureSequence,
      })?.id()
    }
    return undefined
  }, [transcriptOptions, alphaFoldStructureSequence, isoformSequences])

  const effectiveTranscriptId = userTranscriptId ?? autoTranscriptId
  const selectedTranscript = transcriptOptions.find(
    f => getId(f) === effectiveTranscriptId,
  )
  const userSelectedProteinSequence =
    isoformSequences?.[effectiveTranscriptId ?? '']

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

  // Reset manual transcript selection when UniProt selection changes
  useEffect(() => {
    setUserTranscriptId(undefined)
  }, [selectedUniprotId])

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
    setUserSelection: setUserTranscriptId,

    transcriptOptions,
    selectedTranscript,
    isoformSequences,
    userSelectedProteinSequence,
    uniprotEntries,
    predictions,
    selectedEntryIndex,
    setSelectedEntryIndex,

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
    showAlphaFoldEntrySelector: !!predictions && !isSequenceMode,
    showSequenceSearchStatus: isSequenceMode,
    showAlphaFoldDBSearchStatus:
      !!finalStructureSequence && !!finalUniprotId && !isSequenceMode,
    isLoading,
  }
}
