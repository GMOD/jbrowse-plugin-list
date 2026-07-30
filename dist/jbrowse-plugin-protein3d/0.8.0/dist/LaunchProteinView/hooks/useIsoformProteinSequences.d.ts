import type { IsoformSequences } from '../utils/util';
import type { Feature } from '@jbrowse/core/util';
export default function useIsoformProteinSequences({ feature, view, }: {
    feature: Feature;
    view?: {
        assemblyNames?: string[];
    };
}): {
    isLoading: boolean;
    isoformSequences: IsoformSequences | undefined;
    error: any;
};
