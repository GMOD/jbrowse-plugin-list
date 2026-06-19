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
    isoformSequences: Record<string, {
        feature: Feature;
        seq: string;
    }> | undefined;
    isLoading: boolean;
    error: any;
    selectedTranscriptId: string | undefined;
    setSelectedTranscriptId: import("react").Dispatch<import("react").SetStateAction<string | undefined>>;
    selectedTranscript: Feature | undefined;
    selectedIsoform: {
        feature: Feature;
        seq: string;
    } | undefined;
};
