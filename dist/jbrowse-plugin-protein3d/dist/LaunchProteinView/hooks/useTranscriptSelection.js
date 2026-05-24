import { useMemo, useState } from 'react';
import { selectBestTranscript } from '../utils/util';
export default function useTranscriptSelection({ options, isoformSequences, structureSequence, }) {
    const [userSelection, setUserSelection] = useState();
    // SYNC: src/LaunchProteinView/hooks/useAlphaFoldDBSearch.ts (same pattern)
    // Auto-select synchronously to avoid render gap
    const autoSelection = useMemo(() => {
        if (isoformSequences !== undefined && userSelection === undefined) {
            return selectBestTranscript({
                options,
                isoformSequences,
                structureSequence,
            })?.id();
        }
        return undefined;
    }, [options, structureSequence, isoformSequences, userSelection]);
    const effectiveSelection = userSelection ?? autoSelection;
    return { userSelection: effectiveSelection, setUserSelection };
}
