export default function useAlphaFoldData({ uniprotId, }: {
    uniprotId?: string;
}): {
    isLoading: boolean;
    isValidating: boolean;
    error: any;
    url: string | undefined;
    confidenceUrl: string | undefined;
    structureSequences: string[] | undefined;
};
