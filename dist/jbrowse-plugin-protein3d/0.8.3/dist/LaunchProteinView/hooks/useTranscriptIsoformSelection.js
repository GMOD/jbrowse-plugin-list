import useIsoformProteinSequences from './useIsoformProteinSequences';
import useTranscriptSelection from './useTranscriptSelection';
import { getId, getTranscriptFeatures, pickStructureSequence, } from '../utils/util';
// Bundles the transcript-isoform wiring shared by all three launch tabs:
// list transcripts, fetch their protein sequences, pick which chain of the
// structure to compare against, auto/manually select a transcript, and resolve
// the selection back to its feature + sequence.
export default function useTranscriptIsoformSelection({ feature, view, structureSequences, resetKey, }) {
    const transcripts = getTranscriptFeatures(feature);
    const { isoformSequences, isLoading, error } = useIsoformProteinSequences({
        feature,
        view,
    });
    const structureSequence = pickStructureSequence(structureSequences, isoformSequences);
    const { userSelection, setUserSelection } = useTranscriptSelection({
        options: transcripts,
        isoformSequences,
        structureSequence,
        resetKey,
    });
    const selectedTranscript = transcripts.find(f => getId(f) === userSelection);
    const selectedIsoform = userSelection
        ? isoformSequences?.[userSelection]
        : undefined;
    return {
        transcripts,
        isoformSequences,
        structureSequence,
        isLoading,
        error,
        selectedTranscriptId: userSelection,
        setSelectedTranscriptId: setUserSelection,
        selectedTranscript,
        selectedIsoform,
    };
}
