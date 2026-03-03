import useUniProtFeatures from './useUniProtFeatures';
function groupFeaturesByType(features) {
    const grouped = {};
    for (const feature of features) {
        grouped[feature.type] ??= [];
        grouped[feature.type].push(feature);
    }
    return grouped;
}
export default function useProteinFeatureTrackData(model, uniprotId) {
    const { features, isLoading, error } = useUniProtFeatures(uniprotId);
    const { pairwiseAlignment } = model;
    if (!uniprotId || isLoading || error || !features || !pairwiseAlignment) {
        return { data: undefined, isLoading, error };
    }
    const sequenceLength = pairwiseAlignment.alns[0].seq.length;
    const groupedFeatures = groupFeaturesByType(features);
    const featureTypes = Object.keys(groupedFeatures);
    return {
        data: { featureTypes, groupedFeatures, sequenceLength },
        isLoading: false,
        error: undefined,
    };
}
//# sourceMappingURL=useProteinFeatureTrackData.js.map