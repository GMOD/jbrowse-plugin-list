import { genomeToTranscriptSeqMapping as g2p } from 'g2p_mapper'

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
  // @ts-expect-error
  return g2p(feature.toJSON())
}
