import { useEffect, useState } from 'react';
import { selectBestTranscript } from '../utils/util';
export default function useTranscriptSelection({ options, isoformSequences, structureSequence, }) {
    const [userSelection, setUserSelection] = useState();
    useEffect(() => {
        if (isoformSequences !== undefined && userSelection === undefined) {
            const best = selectBestTranscript({
                options,
                isoformSequences,
                structureSequence,
            });
            setUserSelection(best?.id());
        }
    }, [options, structureSequence, isoformSequences, userSelection]);
    return { userSelection, setUserSelection };
}
//# sourceMappingURL=useTranscriptSelection.js.map