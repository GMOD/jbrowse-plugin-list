import type { Feature } from '@jbrowse/core/util';
export declare function useFeatureSequence({ view, feature, upDownBp, forceLoad, }: {
    view: {
        assemblyNames?: string[];
    } | undefined;
    feature?: Feature;
    upDownBp?: number;
    forceLoad?: boolean;
}): {
    proteinSequence: string;
    sequence: import("./types").SeqState | undefined;
    error: any;
};
