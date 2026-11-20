import type { SequenceStatus } from './SequenceStatus';
import type { Feature } from '@jbrowse/core/util';
export declare function pickSelectedId(currentId: string, options: Feature[], hasData: ((transcript: Feature) => boolean) | undefined): string;
export declare function useTranscriptSelection({ feature, view, hasData, preferredTranscriptId, }: {
    feature: Feature;
    view: {
        assemblyNames?: string[];
    } | undefined;
    /** which transcripts the panel can offer, when it can only offer some */
    hasData?: (transcript: Feature) => boolean;
    /**
     * the isoform the user right-clicked, when the dialog opened on its gene.
     * Ignored when this gene does not carry it, so a stale id falls back to the
     * longest transcript rather than selecting nothing.
     */
    preferredTranscriptId?: string;
}): {
    options: Feature[];
    selectedId: string;
    setSelectedId: import("react").Dispatch<import("react").SetStateAction<string>>;
    selectedTranscript: Feature | undefined;
    proteinSequence: string;
    error: unknown;
    isLoading: boolean;
    sequenceStatus: SequenceStatus;
    hasData: ((transcript: Feature) => boolean) | undefined;
};
