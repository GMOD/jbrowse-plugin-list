/**
 * Custom hook to manage AlphaFold predictions and selected entry
 */
export default function useAlphaFoldData({ uniprotId, useApiSearch, }: {
    uniprotId?: string;
    useApiSearch?: boolean;
}): {
    predictions: import("./useAlphaFoldUrl").AlphaFoldPrediction[] | undefined;
    isLoading: boolean;
    error: any;
    selectedEntryIndex: number;
    setSelectedEntryIndex: import("react").Dispatch<import("react").SetStateAction<number>>;
    selectedPrediction: import("./useAlphaFoldUrl").AlphaFoldPrediction | undefined;
    url: string | undefined;
    confidenceUrl: string | undefined;
    structureSequence: string | undefined;
};
