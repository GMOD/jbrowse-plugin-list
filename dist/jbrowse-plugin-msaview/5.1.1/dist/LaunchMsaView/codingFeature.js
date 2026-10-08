function isCDS(feature) {
    return feature.get('type')?.toLowerCase() === 'cds';
}
// The feature itself counts: a viral polyprotein hangs its cleavage products
// off its CDS rather than off further CDSs.
export function isCodingFeature(feature) {
    return isCDS(feature) || !!feature.get('subfeatures')?.some(isCodingFeature);
}
