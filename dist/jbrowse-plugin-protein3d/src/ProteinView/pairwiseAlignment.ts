/* eslint-disable @typescript-eslint/restrict-plus-operands,@typescript-eslint/no-confusing-non-null-assertion */
import type { PairwiseAlignment } from '../mappings'

// BLOSUM62 scoring matrix — standard 20 amino acids + B, Z, X, *
// prettier-ignore
const AMINO_ACIDS = ['A','R','N','D','C','Q','E','G','H','I','L','K','M','F','P','S','T','W','Y','V','B','Z','X','*']
// prettier-ignore
const BLOSUM62_RAW = [
//  A   R   N   D   C   Q   E   G   H   I   L   K   M   F   P   S   T   W   Y   V   B   Z   X   *
  [ 4, -1, -2, -2,  0, -1, -1,  0, -2, -1, -1, -1, -1, -2, -1,  1,  0, -3, -2,  0, -2, -1,  0, -4], // A
  [-1,  5,  0, -2, -3,  1,  0, -2,  0, -3, -2,  2, -1, -3, -2, -1, -1, -3, -2, -3, -1,  0, -1, -4], // R
  [-2,  0,  6,  1, -3,  0,  0,  0,  1, -3, -3,  0, -2, -3, -2,  1,  0, -4, -2, -3,  3,  0, -1, -4], // N
  [-2, -2,  1,  6, -3,  0,  2, -1, -1, -3, -4, -1, -3, -3, -1,  0, -1, -4, -3, -3,  4,  1, -1, -4], // D
  [ 0, -3, -3, -3,  9, -3, -4, -3, -3, -1, -1, -3, -1, -2, -3, -1, -1, -2, -2, -1, -3, -3, -2, -4], // C
  [-1,  1,  0,  0, -3,  5,  2, -2,  0, -3, -2,  1,  0, -3, -1,  0, -1, -2, -1, -2,  0,  3, -1, -4], // Q
  [-1,  0,  0,  2, -4,  2,  5, -2,  0, -3, -3,  1, -2, -3, -1,  0, -1, -3, -2, -2,  1,  4, -1, -4], // E
  [ 0, -2,  0, -1, -3, -2, -2,  6, -2, -4, -4, -2, -3, -3, -2,  0, -2, -2, -3, -3, -1, -2, -1, -4], // G
  [-2,  0,  1, -1, -3,  0,  0, -2,  8, -3, -3, -1, -2, -1, -2, -1, -2, -2,  2, -3,  0,  0, -1, -4], // H
  [-1, -3, -3, -3, -1, -3, -3, -4, -3,  4,  2, -3,  1,  0, -3, -2, -1, -3, -1,  3, -3, -3, -1, -4], // I
  [-1, -2, -3, -4, -1, -2, -3, -4, -3,  2,  4, -2,  2,  0, -3, -2, -1, -2, -1,  1, -4, -3, -1, -4], // L
  [-1,  2,  0, -1, -3,  1,  1, -2, -1, -3, -2,  5, -1, -3, -1,  0, -1, -3, -2, -2,  0,  1, -1, -4], // K
  [-1, -1, -2, -3, -1,  0, -2, -3, -2,  1,  2, -1,  5,  0, -2, -1, -1, -1, -1,  1, -3, -1, -1, -4], // M
  [-2, -3, -3, -3, -2, -3, -3, -3, -1,  0,  0, -3,  0,  6, -4, -2, -2,  1,  3, -1, -3, -3, -1, -4], // F
  [-1, -2, -2, -1, -3, -1, -1, -2, -2, -3, -3, -1, -2, -4,  7, -1, -1, -4, -3, -2, -2, -1, -2, -4], // P
  [ 1, -1,  1,  0, -1,  0,  0,  0, -1, -2, -2,  0, -1, -2, -1,  4,  1, -3, -2, -2,  0,  0,  0, -4], // S
  [ 0, -1,  0, -1, -1, -1, -1, -2, -2, -1, -1, -1, -1, -2, -1,  1,  5, -2, -2,  0, -1, -1,  0, -4], // T
  [-3, -3, -4, -4, -2, -2, -3, -2, -2, -3, -2, -3, -1,  1, -4, -3, -2, 11,  2, -3, -4, -3, -2, -4], // W
  [-2, -2, -2, -3, -2, -1, -2, -3,  2, -1, -1, -2, -1,  3, -3, -2, -2,  2,  7, -1, -3, -2, -1, -4], // Y
  [ 0, -3, -3, -3, -1, -2, -2, -3, -3,  3,  1, -2,  1, -1, -2, -2,  0, -3, -1,  4, -3, -2, -1, -4], // V
  [-2, -1,  3,  4, -3,  0,  1, -1,  0, -3, -4,  0, -3, -3, -2,  0, -1, -4, -3, -3,  4,  1, -1, -4], // B
  [-1,  0,  0,  1, -3,  3,  4, -2,  0, -3, -3,  1, -1, -3, -1,  0, -1, -3, -2, -2,  1,  4, -1, -4], // Z
  [ 0, -1, -1, -1, -2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -2,  0,  0, -2, -1, -1, -1, -1, -1, -4], // X
  [-4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4,  1], // *
]

const BLOSUM62: Record<string, Record<string, number>> = {}
for (let i = 0; i < AMINO_ACIDS.length; i++) {
  const row: Record<string, number> = {}
  for (let j = 0; j < AMINO_ACIDS.length; j++) {
    row[AMINO_ACIDS[j]!] = BLOSUM62_RAW[i]![j]!
  }
  BLOSUM62[AMINO_ACIDS[i]!] = row
}

function getScore(a: string, b: string) {
  return BLOSUM62[a.toUpperCase()]?.[b.toUpperCase()] ?? -4
}

// Default gap penalties (matching EMBOSS defaults)
const GAP_OPEN = -10
const GAP_EXTEND = -0.5

interface AlignmentResult {
  alignedSeq1: string
  alignedSeq2: string
  score: number
}

/**
 * Needleman-Wunsch global alignment algorithm
 * Aligns entire sequences end-to-end
 */
export function needlemanWunsch(
  seq1: string,
  seq2: string,
  gapOpen = GAP_OPEN,
  gapExtend = GAP_EXTEND,
): AlignmentResult {
  const m = seq1.length
  const n = seq2.length

  // Score matrices
  const M: number[][] = [] // match/mismatch
  const Ix: number[][] = [] // gap in seq2 (insertion in seq1)
  const Iy: number[][] = [] // gap in seq1 (insertion in seq2)

  // Initialize matrices
  for (let i = 0; i <= m; i++) {
    M[i] = []
    Ix[i] = []
    Iy[i] = []
    for (let j = 0; j <= n; j++) {
      M[i]![j] = -Infinity
      Ix[i]![j] = -Infinity
      Iy[i]![j] = -Infinity
    }
  }

  // Base cases
  M[0]![0] = 0
  for (let i = 1; i <= m; i++) {
    Ix[i]![0] = gapOpen + (i - 1) * gapExtend
  }
  for (let j = 1; j <= n; j++) {
    Iy[0]![j] = gapOpen + (j - 1) * gapExtend
  }

  // Fill matrices
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const matchScore = getScore(seq1[i - 1]!, seq2[j - 1]!)

      // M[i][j]: best score ending with match/mismatch
      M[i]![j] =
        Math.max(M[i - 1]![j - 1]!, Ix[i - 1]![j - 1]!, Iy[i - 1]![j - 1]!) +
        matchScore

      // Ix[i][j]: best score ending with gap in seq2
      Ix[i]![j] = Math.max(M[i - 1]![j]! + gapOpen, Ix[i - 1]![j]! + gapExtend)

      // Iy[i][j]: best score ending with gap in seq1
      Iy[i]![j] = Math.max(M[i]![j - 1]! + gapOpen, Iy[i]![j - 1]! + gapExtend)
    }
  }

  // Traceback
  let alignedSeq1 = ''
  let alignedSeq2 = ''
  let i = m
  let j = n

  // Find which matrix has the best final score
  const finalScores = [M[m]![n]!, Ix[m]![n]!, Iy[m]![n]!]
  const score = Math.max(...finalScores)
  let currentMatrix: 'M' | 'Ix' | 'Iy' =
    score === M[m]![n]! ? 'M' : score === Ix[m]![n]! ? 'Ix' : 'Iy'

  while (i > 0 || j > 0) {
    if (currentMatrix === 'M' && i > 0 && j > 0) {
      alignedSeq1 = seq1[i - 1] + alignedSeq1
      alignedSeq2 = seq2[j - 1] + alignedSeq2

      const matchScore = getScore(seq1[i - 1]!, seq2[j - 1]!)
      const prevM = M[i - 1]![j - 1]!
      const prevIx = Ix[i - 1]![j - 1]!

      if (M[i]![j]! === prevM + matchScore) {
        currentMatrix = 'M'
      } else if (M[i]![j]! === prevIx + matchScore) {
        currentMatrix = 'Ix'
      } else {
        currentMatrix = 'Iy'
      }
      i--
      j--
    } else if (currentMatrix === 'Ix' && i > 0) {
      alignedSeq1 = seq1[i - 1] + alignedSeq1
      alignedSeq2 = '-' + alignedSeq2

      if (Ix[i]![j]! === M[i - 1]![j]! + gapOpen) {
        currentMatrix = 'M'
      } else {
        currentMatrix = 'Ix'
      }
      i--
    } else if (j > 0) {
      alignedSeq1 = '-' + alignedSeq1
      alignedSeq2 = seq2[j - 1] + alignedSeq2

      if (Iy[i]![j]! === M[i]![j - 1]! + gapOpen) {
        currentMatrix = 'M'
      } else {
        currentMatrix = 'Iy'
      }
      j--
    } else {
      break
    }
  }

  return { alignedSeq1, alignedSeq2, score }
}

/**
 * Smith-Waterman local alignment algorithm
 * Finds the best local alignment between subsequences
 */
export function smithWaterman(
  seq1: string,
  seq2: string,
  gapOpen = GAP_OPEN,
  gapExtend = GAP_EXTEND,
): AlignmentResult {
  const m = seq1.length
  const n = seq2.length

  // Score matrices
  const M: number[][] = []
  const Ix: number[][] = []
  const Iy: number[][] = []

  // Track best score position
  let bestScore = 0
  let bestI = 0
  let bestJ = 0

  // Initialize matrices
  for (let i = 0; i <= m; i++) {
    M[i] = []
    Ix[i] = []
    Iy[i] = []
    for (let j = 0; j <= n; j++) {
      M[i]![j] = 0
      Ix[i]![j] = -Infinity
      Iy[i]![j] = -Infinity
    }
  }

  // Fill matrices
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const matchScore = getScore(seq1[i - 1]!, seq2[j - 1]!)

      // M[i][j]: best score ending with match/mismatch (or 0 to restart)
      M[i]![j] = Math.max(
        0,
        M[i - 1]![j - 1]! + matchScore,
        Ix[i - 1]![j - 1]! + matchScore,
        Iy[i - 1]![j - 1]! + matchScore,
      )

      // Ix[i][j]: best score ending with gap in seq2
      Ix[i]![j] = Math.max(M[i - 1]![j]! + gapOpen, Ix[i - 1]![j]! + gapExtend)

      // Iy[i][j]: best score ending with gap in seq1
      Iy[i]![j] = Math.max(M[i]![j - 1]! + gapOpen, Iy[i]![j - 1]! + gapExtend)

      // Track best score
      const cellMax = Math.max(M[i]![j]!, Ix[i]![j]!, Iy[i]![j]!)
      if (cellMax > bestScore) {
        bestScore = cellMax
        bestI = i
        bestJ = j
      }
    }
  }

  // Traceback from best score position
  let alignedSeq1 = ''
  let alignedSeq2 = ''
  let i = bestI
  let j = bestJ

  // Determine starting matrix
  let currentMatrix: 'M' | 'Ix' | 'Iy' =
    M[i]![j]! >= Ix[i]![j]! && M[i]![j]! >= Iy[i]![j]!
      ? 'M'
      : Ix[i]![j]! >= Iy[i]![j]!
        ? 'Ix'
        : 'Iy'

  // Add trailing gaps for positions after local alignment
  for (let k = seq1.length; k > bestI; k--) {
    alignedSeq1 = seq1[k - 1] + alignedSeq1
    alignedSeq2 = '-' + alignedSeq2
  }
  for (let k = seq2.length; k > bestJ; k--) {
    alignedSeq1 = '-' + alignedSeq1
    alignedSeq2 = seq2[k - 1] + alignedSeq2
  }

  while (i > 0 && j > 0) {
    if (currentMatrix === 'M') {
      if (M[i]![j]! === 0) {
        break
      }

      alignedSeq1 = seq1[i - 1] + alignedSeq1
      alignedSeq2 = seq2[j - 1] + alignedSeq2

      const matchScore = getScore(seq1[i - 1]!, seq2[j - 1]!)
      const prevM = M[i - 1]![j - 1]!
      const prevIx = Ix[i - 1]![j - 1]!

      if (M[i]![j]! === prevM + matchScore) {
        currentMatrix = 'M'
      } else if (M[i]![j]! === prevIx + matchScore) {
        currentMatrix = 'Ix'
      } else {
        currentMatrix = 'Iy'
      }
      i--
      j--
    } else if (currentMatrix === 'Ix') {
      alignedSeq1 = seq1[i - 1] + alignedSeq1
      alignedSeq2 = '-' + alignedSeq2

      if (Ix[i]![j]! === M[i - 1]![j]! + gapOpen) {
        currentMatrix = 'M'
      }
      i--
    } else {
      alignedSeq1 = '-' + alignedSeq1
      alignedSeq2 = seq2[j - 1] + alignedSeq2

      if (Iy[i]![j]! === M[i]![j - 1]! + gapOpen) {
        currentMatrix = 'M'
      }
      j--
    }
  }

  // Add leading gaps for positions before local alignment
  while (i > 0) {
    alignedSeq1 = seq1[i - 1] + alignedSeq1
    alignedSeq2 = '-' + alignedSeq2
    i--
  }
  while (j > 0) {
    alignedSeq1 = '-' + alignedSeq1
    alignedSeq2 = seq2[j - 1] + alignedSeq2
    j--
  }

  return { alignedSeq1, alignedSeq2, score: bestScore }
}

function buildConsensus(alignedSeq1: string, alignedSeq2: string) {
  const chars: string[] = []
  for (let i = 0; i < alignedSeq1.length; i++) {
    const a = alignedSeq1[i]!
    const b = alignedSeq2[i]!
    if (a !== '-' && b !== '-' && a.toUpperCase() === b.toUpperCase()) {
      chars.push('|')
    } else if (a !== '-' && b !== '-' && getScore(a, b) > 0) {
      chars.push(':')
    } else {
      chars.push(' ')
    }
  }
  return chars.join('')
}

export type AlignmentType = 'needleman_wunsch' | 'smith_waterman'

export function runLocalAlignment(
  seq1: string,
  seq2: string,
  algorithm: AlignmentType = 'needleman_wunsch',
): PairwiseAlignment {
  const { alignedSeq1, alignedSeq2 } =
    algorithm === 'smith_waterman'
      ? smithWaterman(seq1, seq2)
      : needlemanWunsch(seq1, seq2)

  return {
    consensus: buildConsensus(alignedSeq1, alignedSeq2),
    alns: [
      { id: 'a', seq: alignedSeq1 },
      { id: 'b', seq: alignedSeq2 },
    ],
  }
}
