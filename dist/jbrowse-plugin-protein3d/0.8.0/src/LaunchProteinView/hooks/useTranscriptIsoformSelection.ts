import useIsoformProteinSequences from './useIsoformProteinSequences'
import useTranscriptSelection from './useTranscriptSelection'
import { getId, getTranscriptFeatures } from '../utils/util'

import type { Feature } from '@jbrowse/core/util'

// Bundles the transcript-isoform wiring shared by all three launch tabs:
// list transcripts, fetch their protein sequences, auto/manually select one,
// and resolve the selection back to its feature + sequence.
export default function useTranscriptIsoformSelection({
  feature,
  view,
  structureSequence,
  resetKey,
}: {
  feature: Feature
  view?: { assemblyNames?: string[] }
  structureSequence?: string
  resetKey?: string
}) {
  const transcripts = getTranscriptFeatures(feature)
  const { isoformSequences, isLoading, error } = useIsoformProteinSequences({
    feature,
    view,
  })
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
    isLoading,
    error,
    selectedTranscriptId: userSelection,
    setSelectedTranscriptId: setUserSelection,
    selectedTranscript,
    selectedIsoform,
  }
}
