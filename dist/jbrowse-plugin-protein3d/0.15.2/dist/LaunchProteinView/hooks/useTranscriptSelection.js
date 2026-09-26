import { useState } from 'react';
import { rankableIsoforms } from '../utils/util';
/**
 * The isoform the user right-clicked when it translates, else the one whose
 * protein best matches the structure, which is unknown until the worker has
 * ranked them. The first needs no ranking, so Launch does not wait on one.
 */
export function defaultTranscriptId({ options, isoformSequences, ranking, preferredTranscriptId, }) {
    return rankableIsoforms(options, isoformSequences).some(i => i.id === preferredTranscriptId && i.seq)
        ? preferredTranscriptId
        : ranking && (ranking.matches[0] ?? ranking.nonMatches[0])?.id;
}
export default function useTranscriptSelection({ options, isoformSequences, ranking, preferredTranscriptId, resetKey, }) {
    const [userSelection, setUserSelection] = useState();
    const [prevResetKey, setPrevResetKey] = useState(resetKey);
    if (resetKey !== prevResetKey) {
        setPrevResetKey(resetKey);
        setUserSelection(undefined);
    }
    const autoSelection = isoformSequences !== undefined
        ? defaultTranscriptId({
            options,
            isoformSequences,
            ranking,
            preferredTranscriptId,
        })
        : undefined;
    return { userSelection: userSelection ?? autoSelection, setUserSelection };
}
