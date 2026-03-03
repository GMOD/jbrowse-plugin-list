export interface AlphaFoldPrediction {
    cifUrl: string;
    plddtDocUrl: string;
    sequence: string;
    modelEntityId: string;
}
export default function useAlphaFoldUrl({ uniprotId }: {
    uniprotId?: string;
}): {
    isLoading: boolean;
    predictions: AlphaFoldPrediction[] | undefined;
    error: any;
};
