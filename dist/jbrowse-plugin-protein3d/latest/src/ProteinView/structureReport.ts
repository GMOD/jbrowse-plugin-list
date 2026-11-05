import {
  alignmentQuality,
  getAlphaFoldComplexId,
  getUniprotIdFromAlphaFoldTarget,
  isLowSimilarity,
} from 'p2s_mapper'

import { errorMessage } from './util'

import type { Entity, PairwiseAlignment } from 'p2s_mapper'

export interface ReportedStructure {
  readonly label: string
  readonly url: string | undefined
  readonly data: string | undefined
  readonly pdbId: string | undefined
  readonly uniProtEntry: { uniprotId: string | undefined }
  readonly feature: { name?: unknown; id?: unknown } | undefined
  readonly hidden: boolean
  readonly loading: boolean
  readonly error: unknown
  readonly statusMessage: string | undefined
  readonly mappedEntity: Entity | undefined
  readonly pairwiseAlignment: PairwiseAlignment | undefined
  readonly alignment: PairwiseAlignment | undefined
  readonly alignmentImported: boolean
  readonly exactMatch: boolean
  readonly clickedStructureRanges: readonly { start: number; end: number }[]
}

function text(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function mappingReport(s: ReportedStructure) {
  const { alignment, pairwiseAlignment, mappedEntity } = s
  if (!alignment || !mappedEntity) {
    return undefined
  }
  const quality = alignmentQuality(alignment)
  const stored = pairwiseAlignment
    ? alignmentQuality(pairwiseAlignment)
    : quality
  return {
    entityId: mappedEntity.entityId,
    chains: mappedEntity.chains,
    ...quality,
    lowSimilarity: isLowSimilarity(quality),
    exactMatch: s.exactMatch,
    imported: s.alignmentImported,
    fusionPartnerResiduesUnmapped: stored.aligned - quality.aligned,
  }
}

function sourceOf({ pdbId, url, data }: ReportedStructure) {
  return pdbId
    ? 'pdb'
    : data !== undefined
      ? 'data'
      : url === undefined ||
          getUniprotIdFromAlphaFoldTarget(url) ||
          getAlphaFoldComplexId(url)
        ? 'alphafold'
        : 'url'
}

/**
 * What a structure resolved to, as plain data a script can read instead of
 * the header: its source, the chain the transcript maps to and how well, and
 * what went wrong. `mapping` is absent until the alignment settles, and for a
 * structure with no transcript.
 */
export function structureReport(s: ReportedStructure) {
  return {
    label: s.label,
    source: sourceOf(s),
    url: s.url,
    pdbId: s.pdbId,
    uniprotId: s.uniProtEntry.uniprotId,
    transcript: text(s.feature?.name) ?? text(s.feature?.id),
    hidden: s.hidden,
    loading: s.loading,
    error: s.error === undefined ? undefined : errorMessage(s.error),
    status: s.statusMessage,
    selection: s.clickedStructureRanges.map(({ start, end }) => ({
      start,
      end,
    })),
    mapping: mappingReport(s),
  }
}
