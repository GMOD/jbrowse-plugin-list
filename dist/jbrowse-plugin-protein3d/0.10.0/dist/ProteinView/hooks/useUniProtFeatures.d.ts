export interface UniProtFeature {
    type: string;
    start: number;
    end: number;
    description: string;
    id?: string;
    uniqueId: string;
}
export declare function getFeatureColor(type: string): string;
export default function useUniProtFeatures(uniprotId: string | undefined): {
    features: UniProtFeature[] | undefined;
    error: any;
    isLoading: boolean;
};
