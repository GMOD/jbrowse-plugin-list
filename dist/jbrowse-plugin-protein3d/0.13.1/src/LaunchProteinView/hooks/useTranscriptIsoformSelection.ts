import { useMemo } from 'react'

import { pickStructureSequence } from 'p2s_mapper'

import useIsoformProteinSequences from './useIsoformProteinSequences'
import useTranscriptSelection from './useTranscriptSelection'
import { codingTranscripts } from '../codingFeature'
import { getId, isoformRecords } from '../utils/util'

import type { Feature } from '@jbrowse/core/util'

// Bundles the transcript-isoform wiring shared by all three launch tabs:
// list transcripts, fetch their protein sequences, pick which chain of the
// structure to compare against, auto/manually select a transcript, and resolve
// the selection back to its feature + sequence.
export default function useTranscriptIsoformSelection({
  feature,
  view,
  structureSequences,
  resetKey,
}: {
  feature: Feature
  view?: { assemblyNames?: string[] }
  // every protein chain of the structure, not just the first — see
  // pickStructureSequence
  structureSequences?: string[]
  resetKey?: string
}) {
  const transcripts = codingTranscripts(feature)
  const { isoformSequences, isLoading, error, partialFailure } =
    useIsoformProteinSequences({
      feature,
      view,
    })
  // one alignment per chain, so not once per render
  const structureSequence = useMemo(
    () =>
      pickStructureSequence(
        structureSequences,
        isoformRecords(isoformSequences),
      ),
    [structureSequences, isoformSequences],
  )
  const { userSelection, setUserSelection } = useTranscriptSelection({
    options: transcripts,
    isoformSequences,
    structureSequence,
    resetKey,
  })
  const selectedTranscript = transcripts.find(f => getId(f) === userSelection)
  const selectedIsoform = userSelection
    ? isoformSequences?.[userSelection]
    : undefined

  return {
    transcripts,
    isoformSequences,
    structureSequence,
    isLoading,
    error,
    partialFailure,
    selectedTranscriptId: userSelection,
    setSelectedTranscriptId: setUserSelection,
    selectedTranscript,
    selectedIsoform,
  }
}
