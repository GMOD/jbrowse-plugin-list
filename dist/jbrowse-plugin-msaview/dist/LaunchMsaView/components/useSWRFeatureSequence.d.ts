import type { SeqState } from './types';
import type { Feature } from '@jbrowse/core/util';
export declare function useSWRFeatureSequence({ view, feature, upDownBp, forceLoad, }: {
    view: {
        assemblyNames?: string[];
    } | undefined;
    feature?: Feature;
    upDownBp?: number;
    forceLoad?: boolean;
}): {
    sequence: SeqState | undefined;
    error: any;
};
