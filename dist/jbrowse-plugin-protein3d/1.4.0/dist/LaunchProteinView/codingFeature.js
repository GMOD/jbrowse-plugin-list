import { isGeneLikeType } from '@jbrowse/core/util';
function isCDS(feature) {
    return feature.get('type')?.toLowerCase() === 'cds';
}
function hasDirectCDS(feature) {
    return !!feature.get('subfeatures')?.some(isCDS);
}
// The transcripts the translator can read: the feature itself when its CDS
// records hang directly off it, else each gene-like child that carries them.
// One definition serves the menu gate, the isoform picker and the translator,
// so the menu never promises a protein the dialog cannot compute.
export function codingTranscripts(feature) {
    return hasDirectCDS(feature)
        ? [feature]
        : (feature.get('subfeatures') ?? []).filter(f => isGeneLikeType(f.get('type')) && hasDirectCDS(f));
}
export function isCodingFeature(feature) {
    return codingTranscripts(feature).length > 0;
}
