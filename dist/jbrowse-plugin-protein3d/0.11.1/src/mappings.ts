import { genomeToTranscriptSeqMapping as g2p, getCodonRanges } from 'g2p_mapper'

import type { Feature } from '@jbrowse/core/util'
export interface AlignmentRow {
  id: string
  seq: string
}

/**
 * A two-row alignment whose ROW ORDER IS A CONTRACT: row 0 is the transcript,
 * row 1 is the structure. Every producer honors it — runLocalAlignment is
 * always called as (transcript, structure), and the manual-import dialog tells
 * the user to paste them in that order — and every consumer depends on it, but
 * nothing in the type can enforce it, and swapping the two silently inverts
 * every coordinate map. Read the rows through the accessors below rather than
 * indexing, so a call site states which sequence it means.
 */
export interface PairwiseAlignment {
  consensus: string
  alns: readonly [AlignmentRow, AlignmentRow]
}

export const transcriptAlignedSeq = (pa: PairwiseAlignment) => pa.alns[0].seq
export const structureAlignedSeq = (pa: PairwiseAlignment) => pa.alns[1].seq

/** Number of columns, gaps included. Both rows have this length by definition;
 * `pairwiseAlignmentProblem` is what guarantees it. */
export const alignmentLength = (pa: PairwiseAlignment) =>
  transcriptAlignedSeq(pa).length

/**
 * Why a pairwise alignment can't be used, or undefined if it's usable. The two
 * rows must be the same non-zero length — every coordinate map walks them in
 * lockstep, so a ragged pair would map positions to nonsense. Callers that
 * accept alignments from outside (the manual-import dialog) check this and
 * report it; the internal map builders assert on it.
 */
export function pairwiseAlignmentProblem(pa: PairwiseAlignment) {
  const transcript = transcriptAlignedSeq(pa)
  const structure = structureAlignedSeq(pa)
  if (transcript.length === 0 || structure.length === 0) {
    return 'The aligned sequences must not be empty'
  }
  if (transcript.length !== structure.length) {
    return `The two aligned sequences must be the same length (got ${transcript.length} and ${structure.length})`
  }
  return undefined
}

const ungapped = (row: string) => row.replaceAll('-', '').toUpperCase()

/**
 * Why an externally supplied alignment does not describe these two sequences,
 * or undefined if it does. The coordinate maps index the transcript and the
 * structure by counting residues along each row, so a row whose residues are
 * not the sequence being mapped (an alignment made against UniProt canonical
 * for a different isoform, or against another chain) shifts every position
 * after the first difference without any map noticing.
 */
export function pairwiseAlignmentSequenceProblem(
  pa: PairwiseAlignment,
  transcript: string,
  structure: string,
) {
  const t = ungapped(transcriptAlignedSeq(pa))
  const s = ungapped(structureAlignedSeq(pa))
  if (t !== transcript.toUpperCase()) {
    return `The first sequence is not this transcript's translation (${t.length} vs ${transcript.length} residues)`
  }
  if (s !== structure.toUpperCase()) {
    return `The second sequence is not the mapped chain's sequence (${s.length} vs ${structure.length} residues)`
  }
  return undefined
}

export function structureSeqVsTranscriptSeqMap(
  pairwiseAlignment: PairwiseAlignment,
) {
  const problem = pairwiseAlignmentProblem(pairwiseAlignment)
  if (problem) {
    throw new Error(problem)
  }
  const structureSeq = structureAlignedSeq(pairwiseAlignment)
  const transcriptSeq = transcriptAlignedSeq(pairwiseAlignment)

  let j = 0
  let k = 0
  const structureSeqToTranscriptSeqPosition: Record<number, number> = {}
  const transcriptSeqToStructureSeqPosition: Record<number, number> = {}

  for (let i = 0; i < structureSeq.length; i++) {
    const inStructure = structureSeq[i] !== '-'
    const inTranscript = transcriptSeq[i] !== '-'
    if (inStructure && inTranscript) {
      structureSeqToTranscriptSeqPosition[j] = k
      transcriptSeqToStructureSeqPosition[k] = j
    }
    if (inStructure) {
      j++
    }
    if (inTranscript) {
      k++
    }
  }

  return {
    structureSeqToTranscriptSeqPosition,
    transcriptSeqToStructureSeqPosition,
  }
}

/** Each 0-based structure position opposite a transcript residue, and whether
 * the two residues are identical. */
export function mappedStructureIdentity(pa: PairwiseAlignment) {
  const transcript = transcriptAlignedSeq(pa)
  const structure = structureAlignedSeq(pa)
  const mapped = new Map<number, boolean>()
  for (let i = 0, j = 0; i < structure.length; i++) {
    if (structure[i] !== '-') {
      if (transcript[i] !== '-') {
        mapped.set(
          j,
          transcript[i]!.toUpperCase() === structure[i]!.toUpperCase(),
        )
      }
      j++
    }
  }
  return mapped
}

/**
 * The alignment with each listed structure position taken out of its column,
 * so both rows still spell their sequences and those residues map to nothing.
 * An unmapped region, including the gap columns inside it, becomes its
 * transcript residues against gaps, then gaps against its structure residues,
 * rather than alternating column by column. Returns `pa` itself when nothing
 * changes.
 */
export function unmapStructurePositions(
  pa: PairwiseAlignment,
  positions: ReadonlySet<number>,
): PairwiseAlignment {
  const transcript = transcriptAlignedSeq(pa)
  const structure = structureAlignedSeq(pa)
  const t: string[] = []
  const s: string[] = []
  const c: string[] = []
  const runT: string[] = []
  const runS: string[] = []
  const flushRun = () => {
    t.push(...runT, ...runS.map(() => '-'))
    s.push(...runT.map(() => '-'), ...runS)
    c.push(...runT.map(() => ' '), ...runS.map(() => ' '))
    runT.length = 0
    runS.length = 0
  }
  let j = 0
  let changed = false
  for (let i = 0; i < structure.length; i++) {
    const inStructure = structure[i] !== '-'
    const inTranscript = transcript[i] !== '-'
    if (inStructure && inTranscript && positions.has(j)) {
      runT.push(transcript[i]!)
      runS.push(structure[i]!)
      changed = true
    } else if (runT.length > 0 && !(inStructure && inTranscript)) {
      if (inTranscript) {
        runT.push(transcript[i]!)
      }
      if (inStructure) {
        runS.push(structure[i]!)
      }
    } else {
      flushRun()
      t.push(transcript[i]!)
      s.push(structure[i]!)
      c.push(pa.consensus[i] ?? ' ')
    }
    if (inStructure) {
      j++
    }
  }
  flushRun()
  return changed
    ? {
        consensus: c.join(''),
        alns: [
          { ...pa.alns[0], seq: t.join('') },
          { ...pa.alns[1], seq: s.join('') },
        ],
      }
    : pa
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
  return seqPositionToAlignmentMap(structureAlignedSeq(pairwiseAlignment))
}

export function transcriptPositionToAlignmentMap(
  pairwiseAlignment: PairwiseAlignment,
) {
  return seqPositionToAlignmentMap(transcriptAlignedSeq(pairwiseAlignment))
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
    ? [Math.min(...ranges.map(r => r[0])), Math.max(...ranges.map(r => r[1]))]
    : undefined
}
