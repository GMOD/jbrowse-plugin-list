import { genomeToTranscriptSeqMapping as g2p, getCodonRanges } from 'g2p_mapper'

import type { Feature } from '@jbrowse/core/util'
export interface AlignmentRow {
  id: string
  seq: string
}
export interface PairwiseAlignment {
  consensus: string
  alns: readonly [AlignmentRow, AlignmentRow]
}

export function structureSeqVsTranscriptSeqMap(
  pairwiseAlignment: PairwiseAlignment,
) {
  const structureSeq = pairwiseAlignment.alns[1].seq
  const transcriptSeq = pairwiseAlignment.alns[0].seq
  if (structureSeq.length !== transcriptSeq.length) {
    throw new Error('mismatched length')
  }

  let j = 0
  let k = 0
  const structureSeqToTranscriptSeqPosition: Record<number, number> = {}
  const transcriptSeqToStructureSeqPosition: Record<number, number> = {}

  for (let i = 0; i < structureSeq.length; i++) {
    const c1 = structureSeq[i]
    const c2 = transcriptSeq[i]

    if (c2 === '-') {
      j++
    } else if (c1 === '-') {
      k++
    } else {
      structureSeqToTranscriptSeqPosition[j] = k
      transcriptSeqToStructureSeqPosition[k] = j
      k++
      j++
    }
  }

  return {
    structureSeqToTranscriptSeqPosition,
    transcriptSeqToStructureSeqPosition,
  }
}

function seqPositionToAlignmentMap(seq: string) {
  const map: Record<number, number> = {}
  for (let i = 0, j = 0; i < seq.length; i++) {
    if (seq[i] !== '-') {
      map[j] = i
      j++
    }
  }
  return map
}

export function structurePositionToAlignmentMap(
  pairwiseAlignment: PairwiseAlignment,
) {
  return seqPositionToAlignmentMap(pairwiseAlignment.alns[1].seq)
}

export function transcriptPositionToAlignmentMap(
  pairwiseAlignment: PairwiseAlignment,
) {
  return seqPositionToAlignmentMap(pairwiseAlignment.alns[0].seq)
}

// see similar function in msaview plugin
export function genomeToTranscriptSeqMapping(feature: Feature) {
  return g2p(feature.toJSON())
}

// Enclosing 0-based half-open [start, end) genome span for a codon. getCodonRanges
// returns the codon's separate genomic pieces (multiple when it straddles an
// exon/intron boundary); this collapses them to the outer span for navigation
// and highlighting. undefined when the protein position isn't mapped.
export function codonGenomeSpan(
  p2gCodon: Record<number, number[]>,
  proteinPos: number,
): readonly [number, number] | undefined {
  const ranges = getCodonRanges(p2gCodon, proteinPos)
  return ranges && ranges.length > 0
    ? [
        Math.min(...ranges.map(r => r[0])),
        Math.max(...ranges.map(r => r[1])),
      ]
    : undefined
}
