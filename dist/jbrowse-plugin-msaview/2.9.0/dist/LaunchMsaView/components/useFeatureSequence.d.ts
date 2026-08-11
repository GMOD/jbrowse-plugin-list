import type { Feature } from '@jbrowse/core/util';
export declare function useFeatureSequence({ view, feature, }: {
    view: {
        assemblyNames?: string[];
    } | undefined;
    feature?: Feature;
}): {
    proteinSequence: string;
    sequence: {
        seq: string;
    } | undefined;
    error: any;
};
