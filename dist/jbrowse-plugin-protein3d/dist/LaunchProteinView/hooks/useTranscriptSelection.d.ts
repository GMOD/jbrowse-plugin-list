import type { Feature } from '@jbrowse/core/util';
export default function useTranscriptSelection({ options, isoformSequences, structureSequence, }: {
    options: Feature[];
    isoformSequences?: Record<string, {
        feature: Feature;
        seq: string;
    }>;
    structureSequence?: string;
}): {
    userSelection: string | undefined;
    setUserSelection: import("react").Dispatch<import("react").SetStateAction<string | undefined>>;
};
