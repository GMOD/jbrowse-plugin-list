import { colord } from '@jbrowse/core/util/colord'

import { placeValues } from './variantEffects'

import type { GenomeNaming } from './util'
import type { PlacedValues } from './variantEffects'

/**
 * One accession of jbrowse-plugin-msaview's `connectedDomains`. A CDD site is
 * scattered residues, so its regions are many short pieces, often one codon,
 * and a codon split by an intron is two.
 */
export interface ConnectedDomain {
  /** the alignment's legend label */
  name: string
  accession: string
  /** the CSS color the alignment fills the domain with */
  color: string
  /** 0-based half-open, one per exon piece, in the transcript's spelling */
  regions: readonly { refName: string; start: number; end: number }[]
}

/** The part of jbrowse-plugin-msaview's MsaView model read here. */
interface MsaViewLike {
  type: string
  connectedViewId?: string
  /** most residues first, so a site nested in its domain comes after it */
  connectedDomains?: readonly ConnectedDomain[]
}

/** A domain as the structure theme paints it, color as 0xRRGGBB */
export interface DomainStyle {
  name: string
  color: number
}

export interface AlignmentDomainStatus {
  domains: readonly DomainStyle[]
  /** each residue's index into `domains`, by label_seq_id */
  placed?: PlacedValues
  /** why the structure stays grey */
  message?: string
}

function rgbNumber(css: string) {
  const { r, g, b } = colord(css).toRgb()
  return (r << 16) | (g << 8) | b
}

/**
 * The domain each transcript residue falls in, as an index into `domains`. A
 * residue takes the last domain in order with a base of its codon inside, so
 * a site painted after the domain holding it lands on top.
 */
export function domainIndexByTranscriptPos(
  domains: readonly ConnectedDomain[],
  mapping: { g2p: Record<number, number>; refName: string },
  { canonicalRefName }: GenomeNaming,
) {
  const refName = canonicalRefName(mapping.refName)
  const byPos = new Map<number, number>()
  domains.forEach(({ regions }, index) => {
    for (const region of regions) {
      if (canonicalRefName(region.refName) === refName) {
        for (let base = region.start; base < region.end; base++) {
          const pos = mapping.g2p[base]
          if (pos !== undefined) {
            byPos.set(pos, index)
          }
        }
      }
    }
  })
  return byPos
}

/**
 * The domains of the first alignment connected to the structure's genome view
 * that shows any, placed on the mapped entity through the genome: region →
 * transcript residue (`g2p`) → structure residue. Waits, with no message, for
 * the structure's alignment to the transcript.
 */
export function alignmentDomainStatus({
  views,
  connectedViewId,
  mapping,
  naming,
  entity,
  transcriptToStructure,
}: {
  views: readonly MsaViewLike[]
  connectedViewId: string | undefined
  mapping: { g2p: Record<number, number>; refName: string } | undefined
  /** the connected genome view's assembly */
  naming: GenomeNaming
  entity: { entityId: string; seqIds: readonly number[] } | undefined
  transcriptToStructure: Record<number, number> | undefined
}): AlignmentDomainStatus {
  const alignments = connectedViewId
    ? views.filter(
        v => v.type === 'MsaView' && v.connectedViewId === connectedViewId,
      )
    : []
  const connected =
    alignments.find(v => !!v.connectedDomains?.length)?.connectedDomains ?? []
  const domains = connected.map(({ name, color }) => ({
    name,
    color: rgbNumber(color),
  }))
  if (!connectedViewId) {
    return {
      domains,
      message: 'No genome view to read alignment domains through',
    }
  }
  if (alignments.length === 0) {
    return {
      domains,
      message: "No alignment is connected to this structure's genome view",
    }
  }
  if (connected.length === 0) {
    return { domains, message: 'The connected alignment shows no domains' }
  }
  if (!mapping) {
    return { domains, message: 'No transcript to place alignment domains on' }
  }
  const byPos = domainIndexByTranscriptPos(connected, mapping, naming)
  if (byPos.size === 0) {
    return {
      domains,
      message: "None of the alignment's domains fall on this transcript",
    }
  }
  return {
    domains,
    placed:
      entity && transcriptToStructure
        ? placeValues(byPos, pos => transcriptToStructure[pos], entity)
        : undefined,
  }
}
