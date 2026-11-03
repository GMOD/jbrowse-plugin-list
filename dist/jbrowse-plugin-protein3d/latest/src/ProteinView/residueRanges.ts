import type { ResidueRanges } from 'p2s_mapper'

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
