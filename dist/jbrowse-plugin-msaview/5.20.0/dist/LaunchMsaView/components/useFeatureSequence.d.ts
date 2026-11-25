import type { Feature } from '@jbrowse/core/util';
interface ViewLike {
    assemblyNames?: string[];
}
export declare function useFeatureSequence({ view, feature, }: {
    view: ViewLike | undefined;
    feature?: Feature;
}): {
    proteinSequence: string;
    error: unknown;
    isLoading: boolean;
};
export {};
