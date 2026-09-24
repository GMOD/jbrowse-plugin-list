import { SimpleFeature } from '@jbrowse/core/util'

import { codingSpans, genomeToTranscriptSeqMapping } from '../mappings'

import type { SimpleFeatureSerialized } from '@jbrowse/core/util'

/**
 * What ties a 1D protein-annotation genome view back to the transcript it was
 * launched from. Stored on the view itself (see index.ts) so it rides along in
 * the session snapshot; a module-level registry used to hold it and every
 * reload, share link or restore lost the hover link while both views came
 * back.
 */
export interface Protein1DLinkage {
  connectedViewId: string
  feature: SimpleFeatureSerialized
  uniprotId: string
}

export type LinkageMapping = ReturnType<typeof genomeToTranscriptSeqMapping>

interface LinkableView {
  id: string
  proteinLinkage?: Protein1DLinkage
  proteinLinkageMapping?: LinkageMapping
}

export function getProteinLinkage(view: unknown) {
  return (view as LinkableView | undefined)?.proteinLinkage
}

export function getProteinLinkageMapping(view: unknown) {
  return (view as LinkableView | undefined)?.proteinLinkageMapping
}

/** The 1D view showing this UniProt entry, if one is open. */
export function findProteinLinkedView(
  session: { views: { id: string }[] },
  uniprotId: string,
) {
  return session.views.find(v => getProteinLinkage(v)?.uniprotId === uniprotId)
}

export function linkageGenomeMapping(linkage: Protein1DLinkage) {
  return genomeToTranscriptSeqMapping(new SimpleFeature(linkage.feature))
}

export function genomeHighlightsForProteinPosition(
  { p2gCodon, refName }: LinkageMapping,
  proteinPos: number,
) {
  return codingSpans(p2gCodon, [proteinPos]).map(([start, end]) => ({
    refName,
    start,
    end,
  }))
}
