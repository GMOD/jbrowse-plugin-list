import type { Feature } from '@jbrowse/core/util'

// Copied from @jbrowse/core's featureTypes: the barrel export reads undefined
// on a v4 host, and the deep path is not in core's exports map.
const GENE_LIKE_TYPE = /gene(_segment)?$|rna$|transcript/

export function isGeneLikeType(type: string | undefined) {
  return type !== undefined && GENE_LIKE_TYPE.test(type.toLowerCase())
}

function isCDS(feature: Feature) {
  return feature.get('type')?.toLowerCase() === 'cds'
}

function hasDirectCDS(feature: Feature) {
  return !!feature.get('subfeatures')?.some(isCDS)
}

// The transcripts the translator can read: the feature itself when its CDS
// records hang directly off it, else each gene-like child that carries them.
// One definition serves the menu gate, the isoform picker and the translator,
// so the menu never promises a protein the dialog cannot compute.
export function codingTranscripts(feature: Feature) {
  return hasDirectCDS(feature)
    ? [feature]
    : (feature.get('subfeatures') ?? []).filter(
        f => isGeneLikeType(f.get('type')) && hasDirectCDS(f),
      )
}

export function isCodingFeature(feature: Feature) {
  return codingTranscripts(feature).length > 0
}

// The outermost gene-like ancestor, so a click on an isoform opens the dialog
// on the gene with every transcript to choose from, as the canvas host does.
export function geneLikeRoot(feature: Feature) {
  let root = feature
  for (
    let parent = root.parent?.();
    parent && isGeneLikeType(parent.get('type'));
    parent = parent.parent?.()
  ) {
    root = parent
  }
  return root
}
