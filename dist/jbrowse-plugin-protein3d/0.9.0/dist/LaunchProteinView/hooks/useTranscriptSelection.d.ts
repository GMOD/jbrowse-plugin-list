import type { IsoformSequences } from '../utils/util';
import type { Feature } from '@jbrowse/core/util';
export default function useTranscriptSelection({ options, isoformSequences, structureSequence, resetKey, }: {
    options: Feature[];
    isoformSequences?: IsoformSequences;
    structureSequence?: string;
    resetKey?: string;
}): {
    userSelection: string | undefined;
    setUserSelection: import("react").Dispatch<import("react").SetStateAction<string | undefined>>;
};
