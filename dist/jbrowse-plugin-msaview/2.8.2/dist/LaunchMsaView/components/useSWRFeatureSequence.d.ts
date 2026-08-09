import type { Feature } from '@jbrowse/core/util';
export declare function useSWRFeatureSequence({ view, feature, }: {
    view: {
        assemblyNames?: string[];
    } | undefined;
    feature?: Feature;
}): {
    sequence: {
        seq: string;
    } | undefined;
    error: any;
};
