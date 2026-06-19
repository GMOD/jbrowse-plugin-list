import {
  structurePositionToAlignmentMap,
  structureSeqVsTranscriptSeqMap,
  transcriptPositionToAlignmentMap,
} from '../mappings'
import { invertMap } from './util'

import type { PairwiseAlignment } from '../mappings'

/**
 * Branded coordinate spaces. Every position in this plugin is a bare `number`,
 * but the *meaning* differs: a structure residue index is not interchangeable
 * with a transcript residue index or an alignment column, and mixing them is
 * the root cause of the off-by-one class of bugs. Branding makes the compiler
 * reject cross-space mixing; construct values with the helpers below at the
 * boundaries where raw numbers enter (molstar picks, hover events, features).
 *
 * Conventions: all are 0-based. StructurePos indexes the ungapped structure
 * sequence; TranscriptPos the ungapped transcript sequence; AlignmentCol a
 * column of the pairwise alignment (gaps included).
 */
type Branded<B extends string> = number & { readonly __brand: B }
export type StructurePos = Branded<'StructurePos'>
export type TranscriptPos = Branded<'TranscriptPos'>
export type AlignmentCol = Branded<'AlignmentCol'>

export const structurePos = (n: number) => n as StructurePos
export const transcriptPos = (n: number) => n as TranscriptPos
export const alignmentCol = (n: number) => n as AlignmentCol

export interface CoordinateMaps {
  structureSeqToTranscriptSeqPosition: Record<number, number>
  transcriptSeqToStructureSeqPosition: Record<number, number>
  structurePositionToAlignmentMap: Record<number, number>
  transcriptPositionToAlignmentMap: Record<number, number>
  alignmentToStructurePosition: Record<number, number>
  alignmentToTranscriptPosition: Record<number, number>
}

export interface CoordinateMapper {
  structureToTranscript: (p: StructurePos) => TranscriptPos | undefined
  transcriptToStructure: (p: TranscriptPos) => StructurePos | undefined
  structureToAlignment: (p: StructurePos) => AlignmentCol | undefined
  alignmentToStructure: (c: AlignmentCol) => StructurePos | undefined
  transcriptToAlignment: (p: TranscriptPos) => AlignmentCol | undefined
  alignmentToTranscript: (c: AlignmentCol) => TranscriptPos | undefined
  /**
   * Raw lookup tables, for consumers that iterate the whole map rather than
   * convert a single position (e.g. per-residue track rendering, selection of
   * all aligned residues). Plain numbers — prefer the typed methods above for
   * point conversions.
   */
  readonly maps: CoordinateMaps
}

/**
 * Builds every coordinate conversion once from a pairwise alignment, replacing
 * the scatter of per-getter map builds + repeated invertMap calls. The branded
 * methods are the preferred API; `maps` stays unbranded for whole-map consumers.
 */
export function makeCoordinateMapper(
  pairwiseAlignment: PairwiseAlignment,
): CoordinateMapper {
  const {
    structureSeqToTranscriptSeqPosition,
    transcriptSeqToStructureSeqPosition,
  } = structureSeqVsTranscriptSeqMap(pairwiseAlignment)
  const s2aln = structurePositionToAlignmentMap(pairwiseAlignment)
  const t2aln = transcriptPositionToAlignmentMap(pairwiseAlignment)
  const aln2s = invertMap(s2aln)
  const aln2t = invertMap(t2aln)

  // The `as` casts below are the single brand-crossing point: indexing a
  // Record<number,number> yields a plain number that we re-brand to its output
  // space. Isolated here so the rest of the codebase stays brand-clean.
  return {
    structureToTranscript: p =>
      structureSeqToTranscriptSeqPosition[p] as TranscriptPos | undefined,
    transcriptToStructure: p =>
      transcriptSeqToStructureSeqPosition[p] as StructurePos | undefined,
    structureToAlignment: p => s2aln[p] as AlignmentCol | undefined,
    alignmentToStructure: c => aln2s[c] as StructurePos | undefined,
    transcriptToAlignment: p => t2aln[p] as AlignmentCol | undefined,
    alignmentToTranscript: c => aln2t[c] as TranscriptPos | undefined,
    maps: {
      structureSeqToTranscriptSeqPosition,
      transcriptSeqToStructureSeqPosition,
      structurePositionToAlignmentMap: s2aln,
      transcriptPositionToAlignmentMap: t2aln,
      alignmentToStructurePosition: aln2s,
      alignmentToTranscriptPosition: aln2t,
    },
  }
}
