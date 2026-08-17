import { useState } from 'react';
import { selectBestTranscript } from '../utils/util';
export default function useTranscriptSelection({ options, isoformSequences, structureSequence, resetKey, }) {
    const [userSelection, setUserSelection] = useState();
    const [prevResetKey, setPrevResetKey] = useState(resetKey);
    if (resetKey !== prevResetKey) {
        setPrevResetKey(resetKey);
        setUserSelection(undefined);
    }
    const autoSelection = isoformSequences !== undefined
        ? selectBestTranscript({
            options,
            isoformSequences,
            structureSequence,
        })?.id()
        : undefined;
    return { userSelection: userSelection ?? autoSelection, setUserSelection };
}
