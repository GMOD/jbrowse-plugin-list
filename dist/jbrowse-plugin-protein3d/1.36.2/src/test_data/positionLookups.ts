import { alignmentCol, structurePos, transcriptPos } from 'p2s_mapper'

import type { CoordinateMapper } from 'p2s_mapper'

// A CoordinateMapper conversion from a literal table, for a test that names
// the few positions it maps rather than building an alignment

export function toStructure(
  map: Record<number, number>,
): CoordinateMapper['transcriptToStructure'] {
  return p => {
    const v = map[p]
    return v === undefined ? undefined : structurePos(v)
  }
}

export function toTranscript(
  map: Record<number, number>,
): CoordinateMapper['structureToTranscript'] {
  return p => {
    const v = map[p]
    return v === undefined ? undefined : transcriptPos(v)
  }
}

export function toAlignment(
  map: Record<number, number>,
): CoordinateMapper['structureToAlignment'] {
  return p => {
    const v = map[p]
    return v === undefined ? undefined : alignmentCol(v)
  }
}

export function alignmentToStructure(
  map: Record<number, number>,
): CoordinateMapper['alignmentToStructure'] {
  return c => {
    const v = map[c]
    return v === undefined ? undefined : structurePos(v)
  }
}
