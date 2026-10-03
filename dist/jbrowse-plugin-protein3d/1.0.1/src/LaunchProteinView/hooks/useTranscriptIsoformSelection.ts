import useIsoformProteinSequences from './useIsoformProteinSequences'
import useIsoformRanking from './useIsoformRanking'
import useTranscriptSelection from './useTranscriptSelection'
import { codingTranscripts } from '../codingFeature'
import { getId, rankableIsoforms } from '../utils/util'

import type { Feature } from '@jbrowse/core/util'

// Bundles the transcript-isoform wiring shared by all three launch tabs:
// list transcripts, fetch their protein sequences, pick which chain of the
// structure to compare against, auto/manually select a transcript, and resolve
// the selection back to its feature + sequence.
export default function useTranscriptIsoformSelection({
  feature,
  view,
  structureSequences,
  preferredTranscriptId,
  resetKey,
}: {
  feature: Feature
  view?: { assemblyNames?: string[] }
  // every protein chain of the structure, not just the first — see
  // pickStructureSequence
  structureSequences?: string[]
  // the isoform the user right-clicked, when the dialog opened on its gene
  preferredTranscriptId?: string
  resetKey?: string
}) {
  const transcripts = codingTranscripts(feature)
  const { isoformSequences, isLoading, error, partialFailure } =
    useIsoformProteinSequences({
      feature,
      view,
    })
  const { ranking, error: rankingError } = useIsoformRanking({
    view,
    isoforms: rankableIsoforms(transcripts, isoformSequences),
    structureSequences,
  })
  const { userSelection, setUserSelection } = useTranscriptSelection({
    options: transcripts,
    isoformSequences,
    ranking: ranking?.ranking,
    preferredTranscriptId,
    resetKey,
  })
  const selectedTranscript = transcripts.find(f => getId(f) === userSelection)
  const selectedIsoform = userSelection
    ? isoformSequences?.[userSelection]
    : undefined

  return {
    transcripts,
    isoformSequences,
    structureSequence: ranking?.structureSequence,
    ranking: ranking?.ranking,
    isLoading,
    // only while the ranking is what the selection waits on; the
    // right-clicked isoform launches without one, and the picker follows
    isRanking:
      !!isoformSequences && !ranking && !rankingError && !userSelection,
    error: error ?? rankingError,
    partialFailure,
    selectedTranscriptId: userSelection,
    setSelectedTranscriptId: setUserSelection,
    selectedTranscript,
    selectedIsoform,
  }
}
