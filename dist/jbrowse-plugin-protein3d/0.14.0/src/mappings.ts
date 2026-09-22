import { genomeToTranscriptSeqMapping as g2p, getCodonRanges } from 'g2p_mapper'

import type { Feature } from '@jbrowse/core/util'
import type { Feat } from 'g2p_mapper'

// The alignment and coordinate machinery this used to hold lives in p2s_mapper;
// what stays is the one step that needs a JBrowse feature. See the similar
// function in the msaview plugin.
export function genomeToTranscriptSeqMapping(feature: Feature) {
  return g2p(feature.toJSON() as Feat)
}

/**
 * The genome under some residues of a transcript, one 0-based half-open span
 * per stretch of contiguous coding bases, in genome order. A codon split by an
 * intron is two spans, so no band drawn from these crosses the intron.
 */
export function codingSpans(
  p2gCodon: Record<number, number[]>,
  transcriptPositions: Iterable<number>,
) {
  const pieces: [number, number][] = []
  for (const pos of transcriptPositions) {
    pieces.push(...(getCodonRanges(p2gCodon, pos) ?? []))
  }
  const spans: [number, number][] = []
  for (const [start, end] of pieces.toSorted((a, b) => a[0] - b[0])) {
    const last = spans.at(-1)
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end)
    } else {
      spans.push([start, end])
    }
  }
  return spans
}
