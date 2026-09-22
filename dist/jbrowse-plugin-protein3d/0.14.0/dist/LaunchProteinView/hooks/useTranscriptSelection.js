import { useState } from 'react';
import { selectBestTranscript } from 'p2s_mapper';
import { rankableIsoforms } from '../utils/util';
/**
 * The isoform the user right-clicked when it translates, else the one whose
 * protein best matches the structure.
 */
export function defaultTranscriptId({ options, isoformSequences, structureSequence, preferredTranscriptId, }) {
    const isoforms = rankableIsoforms(options, isoformSequences);
    return isoforms.some(i => i.id === preferredTranscriptId && i.seq)
        ? preferredTranscriptId
        : selectBestTranscript({ isoforms, structureSequence });
}
export default function useTranscriptSelection({ options, isoformSequences, structureSequence, preferredTranscriptId, resetKey, }) {
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
            structureSequence,
            preferredTranscriptId,
        })
        : undefined;
    return { userSelection: userSelection ?? autoSelection, setUserSelection };
}
