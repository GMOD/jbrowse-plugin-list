import { genomeHoverToTranscriptPos, literalNaming } from './util'

import type { GenomeNaming } from './util'
import type { Region } from '@jbrowse/core/util/types'

interface SessionView {
  id: string
  type: string
  connectedViewId?: string
}

/** The part of jbrowse-plugin-msaview's MsaView model read here. */
interface MsaViewLike extends SessionView {
  /** Genome regions (a codon) under the alignment column the pointer is on,
   * through the MSA's own link to the transcript. */
  connectedHoverHighlights?: Region[]
}

/**
 * The transcript residue a pointer elsewhere in the session is on: the genome
 * view's hover first, else the hovered column of any alignment connected to the
 * same genome view, which is how msaview pairs with a structure too.
 *
 * The alignment is read as the codon msaview maps its column to, never as a
 * column number: the genome is the one coordinate the two plugins share, so
 * this holds for any alignment whose query row is linked to the transcript,
 * such as a Pfam seed row cut to one domain.
 */
export function connectedHoverTranscriptPos({
  hovered,
  views,
  mapping,
  connectedViewId,
  genomeViewReady,
  naming = literalNaming,
}: {
  hovered: unknown
  views: MsaViewLike[]
  mapping: { g2p: Record<number, number>; refName: string } | undefined
  connectedViewId: string | undefined
  genomeViewReady: boolean
  /** the connected genome view's assembly */
  naming?: GenomeNaming
}): { transcriptPos: number; source: 'genome' | 'msa' } | undefined {
  const fromGenome = genomeViewReady
    ? genomeHoverToTranscriptPos(hovered, mapping, naming)
    : undefined
  if (fromGenome !== undefined) {
    return { transcriptPos: fromGenome, source: 'genome' }
  }
  const codon = connectedViewId
    ? views.find(
        v =>
          v.type === 'MsaView' &&
          v.connectedViewId === connectedViewId &&
          !!v.connectedHoverHighlights?.length,
      )?.connectedHoverHighlights?.[0]
    : undefined
  const { canonicalRefName } = naming
  const fromMsa =
    mapping &&
    codon &&
    canonicalRefName(codon.refName) === canonicalRefName(mapping.refName)
      ? mapping.g2p[codon.start]
      : undefined
  return fromMsa === undefined
    ? undefined
    : { transcriptPos: fromMsa, source: 'msa' }
}
