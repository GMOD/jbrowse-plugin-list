import { UniProtFeature } from './useUniProtFeatures';
import { JBrowsePluginProteinStructureModel } from '../model';
type FeaturesByType = Record<string, UniProtFeature[]>;
export interface FeatureTrackData {
    featureTypes: string[];
    groupedFeatures: FeaturesByType;
    sequenceLength: number;
}
export default function useProteinFeatureTrackData(model: JBrowsePluginProteinStructureModel, uniprotId: string | undefined): {
    data: FeatureTrackData | undefined;
    isLoading: boolean;
    error: unknown;
};
export {};
