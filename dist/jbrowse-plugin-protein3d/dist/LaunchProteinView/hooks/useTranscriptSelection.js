import { useMemo, useState } from 'react';
import { selectBestTranscript } from '../utils/util';
export default function useTranscriptSelection({ options, isoformSequences, structureSequence, }) {
    const [userSelection, setUserSelection] = useState();
    const autoSelection = useMemo(() => isoformSequences !== undefined
        ? selectBestTranscript({ options, isoformSequences, structureSequence })?.id()
        : undefined, [options, structureSequence, isoformSequences]);
    const effectiveSelection = userSelection ?? autoSelection;
    return { userSelection: effectiveSelection, setUserSelection };
}
