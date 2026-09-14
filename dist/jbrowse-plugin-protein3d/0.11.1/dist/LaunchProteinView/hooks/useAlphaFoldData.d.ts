import type { Feature } from '@jbrowse/core/util';
/** The AlphaFold DB model a launch opens for this gene's accession. */
export default function useAlphaFoldData({ uniprotId, feature, view, }: {
    uniprotId?: string;
    feature: Feature;
    view?: {
        assemblyNames?: string[];
    };
}): {
    isLoading: boolean;
    isValidating: boolean;
    error: any;
    model: import("../services/alphaFoldModels").AlphaFoldModel | undefined;
    noModel: boolean;
};
