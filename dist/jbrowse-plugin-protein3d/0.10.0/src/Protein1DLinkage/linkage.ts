import { SimpleFeature } from '@jbrowse/core/util'

import { codonGenomeSpan, genomeToTranscriptSeqMapping } from '../mappings'

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

interface LinkableView {
  id: string
  proteinLinkage?: Protein1DLinkage
}

export function getProteinLinkage(view: unknown) {
  return (view as LinkableView | undefined)?.proteinLinkage
}

/** The 1D view showing this UniProt entry, if one is open. */
export function findProteinLinkedView(
  session: { views: { id: string }[] },
  uniprotId: string,
) {
  return session.views.find(v => getProteinLinkage(v)?.uniprotId === uniprotId)
}

// The g2p map walks every CDS of the transcript and the hover bridges ask for
// it on every mouse move; the frozen linkage object is a stable key.
const mappings = new WeakMap<
  Protein1DLinkage,
  ReturnType<typeof genomeToTranscriptSeqMapping>
>()

export function linkageGenomeMapping(linkage: Protein1DLinkage) {
  let mapping = mappings.get(linkage)
  if (!mapping) {
    mapping = genomeToTranscriptSeqMapping(new SimpleFeature(linkage.feature))
    mappings.set(linkage, mapping)
  }
  return mapping
}

export function genomeHighlightForProteinPosition(
  linkage: Protein1DLinkage,
  proteinPos: number,
) {
  const { p2gCodon, refName } = linkageGenomeMapping(linkage)
  const span = codonGenomeSpan(p2gCodon, proteinPos)
  return span ? { refName, start: span[0], end: span[1] } : undefined
}
