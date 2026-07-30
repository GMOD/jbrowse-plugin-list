import type { Feature } from '@jbrowse/core/util';
export default function useTranscriptIsoformSelection({ feature, view, structureSequence, resetKey, }: {
    feature: Feature;
    view?: {
        assemblyNames?: string[];
    };
    structureSequence?: string;
    resetKey?: string;
}): {
    transcripts: Feature[];
    isoformSequences: import("../utils/util").IsoformSequences | undefined;
    isLoading: boolean;
    error: any;
    selectedTranscriptId: string | undefined;
    setSelectedTranscriptId: import("react").Dispatch<import("react").SetStateAction<string | undefined>>;
    selectedTranscript: Feature | undefined;
    selectedIsoform: import("../utils/util").IsoformSequence | undefined;
};
