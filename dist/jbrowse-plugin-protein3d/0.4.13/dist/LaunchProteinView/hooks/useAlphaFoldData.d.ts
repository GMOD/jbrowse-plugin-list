export default function useAlphaFoldData({ uniprotId, }: {
    uniprotId?: string;
}): {
    isLoading: boolean;
    isValidating: boolean;
    error: any;
    url: string | undefined;
    confidenceUrl: string | undefined;
    structureSequence: string | undefined;
};
