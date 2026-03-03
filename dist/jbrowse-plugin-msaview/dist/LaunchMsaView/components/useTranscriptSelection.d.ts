import type { Feature } from '@jbrowse/core/util';
export declare function useTranscriptSelection({ feature, view, validIds, }: {
    feature: Feature;
    view: {
        assemblyNames?: string[];
    } | undefined;
    validIds?: string[];
}): {
    options: Feature[];
    selectedId: string;
    setSelectedId: import("react").Dispatch<import("react").SetStateAction<string>>;
    selectedTranscript: Feature | undefined;
    proteinSequence: string;
    error: any;
    validSet: Set<string> | undefined;
};
