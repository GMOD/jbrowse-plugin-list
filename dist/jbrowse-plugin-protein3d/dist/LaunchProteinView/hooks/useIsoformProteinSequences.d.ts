import { Feature } from '@jbrowse/core/util';
export default function useIsoformProteinSequences({ feature, view, }: {
    feature: Feature;
    view?: {
        assemblyNames?: string[];
    };
}): {
    isLoading: boolean;
    isoformSequences: Record<string, {
        feature: Feature;
        seq: string;
    }> | undefined;
    error: any;
};
