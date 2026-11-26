import { isGeneLikeType } from '@jbrowse/core/util'
import { stripStopCodon } from 'p2s_mapper'

import type { Feature } from '@jbrowse/core/util'

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

/** The right-clicked transcript when it has no CDS, so the dialog maps
 * another of the gene's transcripts in its place */
export function uncodedTranscript(feature: Feature, transcriptId?: string) {
  return transcriptId &&
    !codingTranscripts(feature).some(t => t.id() === transcriptId)
    ? feature.get('subfeatures')?.find(f => f.id() === transcriptId)
    : undefined
}

// GENCODE tags the transcript row; NCBI's RefSeq GFF carries no such tag and
// keeps Select status in separate tracks.
const REPRESENTATIVE_TAGS = ['MANE_Select', 'Ensembl_canonical']

function tagsOf(feature: Feature): unknown[] {
  const tag: unknown = feature.get('tag')
  return Array.isArray(tag)
    ? tag
    : typeof tag === 'string'
      ? tag.split(',')
      : []
}

/**
 * A stop codon inside the translation. A trailing one is its ordinary end, and
 * a selenoprotein's is selenocysteine: GENCODE tags its transcript `seleno` and
 * the translation keeps the `*`, while RefSeq's `transl_except` is translated
 * as U and leaves none.
 */
export function hasInternalStop(seq: string, transcript?: Feature) {
  return (
    stripStopCodon(seq).includes('*') &&
    !(transcript && tagsOf(transcript).includes('seleno'))
  )
}

/**
 * What a transcript's translation should be read with: a stop inside it, or a
 * CDS GENCODE tags as running past its annotated start or end.
 */
export function translationCautions(transcript?: Feature, seq?: string) {
  return [
    seq !== undefined && hasInternalStop(seq, transcript) && 'internal stop',
    transcript &&
      tagsOf(transcript).some(
        t => t === 'cds_start_NF' || t === 'cds_end_NF',
      ) &&
      'incomplete CDS',
  ].filter(caution => typeof caution === 'string')
}

/** The transcript its annotation flags as the gene's representative. */
export function flaggedTranscriptId(transcripts: Feature[]) {
  for (const tag of REPRESENTATIVE_TAGS) {
    const flagged = transcripts.find(t => tagsOf(t).includes(tag))
    if (flagged) {
      return flagged.id()
    }
  }
  return undefined
}
