import { SimpleFeature } from '@jbrowse/core/util'

import { assemblyNaming, genomeHoverToTranscriptPos } from '../ProteinView/util'
import { codingSpans, genomeToTranscriptSeqMapping } from '../mappings'

import type { NamingAssemblyManager } from '../ProteinView/util'
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
  /** the genome view's assembly; absent from sessions saved before
   * 2026-09-25, which find it through the view */
  assemblyName?: string
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

/** The assembly of the genome view a 1D view was launched from. */
export function linkedGenomeAssemblyName(
  session: { views: { id: string }[] },
  linkage: Protein1DLinkage,
) {
  if (linkage.assemblyName) {
    return linkage.assemblyName
  }
  const view = session.views.find(v => v.id === linkage.connectedViewId)
  const names = view && 'assemblyNames' in view ? view.assemblyNames : undefined
  const first: unknown = Array.isArray(names) ? names[0] : undefined
  return typeof first === 'string' ? first : undefined
}

/** The residue a genome hover names on a 1D view, read through the assembly
 * of the genome view it was launched from. */
export function hovered1DProteinPosition(
  session: {
    hovered: unknown
    views: { id: string }[]
    assemblyManager: NamingAssemblyManager
  },
  view: unknown,
) {
  const linkage = getProteinLinkage(view)
  const assemblyName = linkage
    ? linkedGenomeAssemblyName(session, linkage)
    : undefined
  return assemblyName
    ? genomeHoverToTranscriptPos(
        session.hovered,
        getProteinLinkageMapping(view),
        assemblyNaming(session.assemblyManager, assemblyName),
      )
    : undefined
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
