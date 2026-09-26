import { residueNumber, transcriptPos } from 'p2s_mapper'

import type { CoordinateMapper, Entity } from 'p2s_mapper'

export interface ResidueRange {
  start: number
  end: number
}

/** One range, or several: the form every selection field of a spec takes. */
export type ResidueRanges = ResidueRange | readonly ResidueRange[]

/**
 * What to select, in any of the three numberings a spec may use. `positions`
 * are 0-based half-open structure positions; `residues` inclusive author
 * numbers; `transcriptResidues` inclusive 1-based residues of the transcript.
 */
export interface SelectionTarget {
  positions?: ResidueRanges
  residues?: ResidueRanges
  transcriptResidues?: ResidueRanges
}

export function rangeList(ranges: ResidueRanges | undefined) {
  return ranges === undefined ? [] : 'start' in ranges ? [ranges] : ranges
}

/**
 * Collapse a set of positions into sorted, contiguous [start, end) runs.
 */
export function positionRuns(positions: Iterable<number>) {
  const sorted = [...new Set(positions)].sort((a, b) => a - b)
  const runs: ResidueRange[] = []
  for (const pos of sorted) {
    const last = runs.at(-1)
    if (last?.end === pos) {
      last.end = pos + 1
    } else {
      runs.push({ start: pos, end: pos + 1 })
    }
  }
  return runs
}

function* inclusive({ start, end }: ResidueRange) {
  for (let n = start; n <= end; n++) {
    yield n
  }
}

/**
 * The runs of positions whose author number falls in any of the ranges. A
 * fusion numbers its partner apart (2RH1's lysozyme is 1002–1161), so a range
 * across the fusion site selects the receptor on both sides and not the
 * partner between.
 */
export function residueRuns(entity: Entity | undefined, ranges: ResidueRanges) {
  const list = rangeList(ranges)
  const positions: number[] = []
  for (let pos = 0; pos < (entity?.seq.length ?? 0); pos++) {
    const n = residueNumber(entity, pos)
    if (list.some(r => n >= r.start && n <= r.end)) {
      positions.push(pos)
    }
  }
  return positionRuns(positions)
}

/**
 * The runs of structure positions the alignment pairs with any of the
 * transcript ranges. A structure residue the transcript lacks, an inserted tag
 * or a fusion partner SIFTS unmaps, splits the run rather than being selected.
 */
export function transcriptRuns(
  mapper: CoordinateMapper,
  ranges: ResidueRanges,
) {
  const positions: number[] = []
  for (const range of rangeList(ranges)) {
    for (const residue of inclusive(range)) {
      const pos = mapper.transcriptToStructure(transcriptPos(residue - 1))
      if (pos !== undefined) {
        positions.push(pos)
      }
    }
  }
  return positionRuns(positions)
}

export function positionRangeRuns(ranges: ResidueRanges) {
  const positions: number[] = []
  for (const { start, end } of rangeList(ranges)) {
    for (let pos = start; pos < end; pos++) {
      positions.push(pos)
    }
  }
  return positionRuns(positions)
}
