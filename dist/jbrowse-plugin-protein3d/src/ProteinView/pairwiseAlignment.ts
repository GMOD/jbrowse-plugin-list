/* eslint-disable @typescript-eslint/restrict-plus-operands,@typescript-eslint/no-confusing-non-null-assertion */
import { PairwiseAlignment } from '../mappings'

// BLOSUM62 scoring matrix for protein sequence alignment
// Standard 20 amino acids + B, Z, X, *
const BLOSUM62: Record<string, Record<string, number>> = {
  A: {
    A: 4,
    R: -1,
    N: -2,
    D: -2,
    C: 0,
    Q: -1,
    E: -1,
    G: 0,
    H: -2,
    I: -1,
    L: -1,
    K: -1,
    M: -1,
    F: -2,
    P: -1,
    S: 1,
    T: 0,
    W: -3,
    Y: -2,
    V: 0,
    B: -2,
    Z: -1,
    X: 0,
    '*': -4,
  },
  R: {
    A: -1,
    R: 5,
    N: 0,
    D: -2,
    C: -3,
    Q: 1,
    E: 0,
    G: -2,
    H: 0,
    I: -3,
    L: -2,
    K: 2,
    M: -1,
    F: -3,
    P: -2,
    S: -1,
    T: -1,
    W: -3,
    Y: -2,
    V: -3,
    B: -1,
    Z: 0,
    X: -1,
    '*': -4,
  },
  N: {
    A: -2,
    R: 0,
    N: 6,
    D: 1,
    C: -3,
    Q: 0,
    E: 0,
    G: 0,
    H: 1,
    I: -3,
    L: -3,
    K: 0,
    M: -2,
    F: -3,
    P: -2,
    S: 1,
    T: 0,
    W: -4,
    Y: -2,
    V: -3,
    B: 3,
    Z: 0,
    X: -1,
    '*': -4,
  },
  D: {
    A: -2,
    R: -2,
    N: 1,
    D: 6,
    C: -3,
    Q: 0,
    E: 2,
    G: -1,
    H: -1,
    I: -3,
    L: -4,
    K: -1,
    M: -3,
    F: -3,
    P: -1,
    S: 0,
    T: -1,
    W: -4,
    Y: -3,
    V: -3,
    B: 4,
    Z: 1,
    X: -1,
    '*': -4,
  },
  C: {
    A: 0,
    R: -3,
    N: -3,
    D: -3,
    C: 9,
    Q: -3,
    E: -4,
    G: -3,
    H: -3,
    I: -1,
    L: -1,
    K: -3,
    M: -1,
    F: -2,
    P: -3,
    S: -1,
    T: -1,
    W: -2,
    Y: -2,
    V: -1,
    B: -3,
    Z: -3,
    X: -2,
    '*': -4,
  },
  Q: {
    A: -1,
    R: 1,
    N: 0,
    D: 0,
    C: -3,
    Q: 5,
    E: 2,
    G: -2,
    H: 0,
    I: -3,
    L: -2,
    K: 1,
    M: 0,
    F: -3,
    P: -1,
    S: 0,
    T: -1,
    W: -2,
    Y: -1,
    V: -2,
    B: 0,
    Z: 3,
    X: -1,
    '*': -4,
  },
  E: {
    A: -1,
    R: 0,
    N: 0,
    D: 2,
    C: -4,
    Q: 2,
    E: 5,
    G: -2,
    H: 0,
    I: -3,
    L: -3,
    K: 1,
    M: -2,
    F: -3,
    P: -1,
    S: 0,
    T: -1,
    W: -3,
    Y: -2,
    V: -2,
    B: 1,
    Z: 4,
    X: -1,
    '*': -4,
  },
  G: {
    A: 0,
    R: -2,
    N: 0,
    D: -1,
    C: -3,
    Q: -2,
    E: -2,
    G: 6,
    H: -2,
    I: -4,
    L: -4,
    K: -2,
    M: -3,
    F: -3,
    P: -2,
    S: 0,
    T: -2,
    W: -2,
    Y: -3,
    V: -3,
    B: -1,
    Z: -2,
    X: -1,
    '*': -4,
  },
  H: {
    A: -2,
    R: 0,
    N: 1,
    D: -1,
    C: -3,
    Q: 0,
    E: 0,
    G: -2,
    H: 8,
    I: -3,
    L: -3,
    K: -1,
    M: -2,
    F: -1,
    P: -2,
    S: -1,
    T: -2,
    W: -2,
    Y: 2,
    V: -3,
    B: 0,
    Z: 0,
    X: -1,
    '*': -4,
  },
  I: {
    A: -1,
    R: -3,
    N: -3,
    D: -3,
    C: -1,
    Q: -3,
    E: -3,
    G: -4,
    H: -3,
    I: 4,
    L: 2,
    K: -3,
    M: 1,
    F: 0,
    P: -3,
    S: -2,
    T: -1,
    W: -3,
    Y: -1,
    V: 3,
    B: -3,
    Z: -3,
    X: -1,
    '*': -4,
  },
  L: {
    A: -1,
    R: -2,
    N: -3,
    D: -4,
    C: -1,
    Q: -2,
    E: -3,
    G: -4,
    H: -3,
    I: 2,
    L: 4,
    K: -2,
    M: 2,
    F: 0,
    P: -3,
    S: -2,
    T: -1,
    W: -2,
    Y: -1,
    V: 1,
    B: -4,
    Z: -3,
    X: -1,
    '*': -4,
  },
  K: {
    A: -1,
    R: 2,
    N: 0,
    D: -1,
    C: -3,
    Q: 1,
    E: 1,
    G: -2,
    H: -1,
    I: -3,
    L: -2,
    K: 5,
    M: -1,
    F: -3,
    P: -1,
    S: 0,
    T: -1,
    W: -3,
    Y: -2,
    V: -2,
    B: 0,
    Z: 1,
    X: -1,
    '*': -4,
  },
  M: {
    A: -1,
    R: -1,
    N: -2,
    D: -3,
    C: -1,
    Q: 0,
    E: -2,
    G: -3,
    H: -2,
    I: 1,
    L: 2,
    K: -1,
    M: 5,
    F: 0,
    P: -2,
    S: -1,
    T: -1,
    W: -1,
    Y: -1,
    V: 1,
    B: -3,
    Z: -1,
    X: -1,
    '*': -4,
  },
  F: {
    A: -2,
    R: -3,
    N: -3,
    D: -3,
    C: -2,
    Q: -3,
    E: -3,
    G: -3,
    H: -1,
    I: 0,
    L: 0,
    K: -3,
    M: 0,
    F: 6,
    P: -4,
    S: -2,
    T: -2,
    W: 1,
    Y: 3,
    V: -1,
    B: -3,
    Z: -3,
    X: -1,
    '*': -4,
  },
  P: {
    A: -1,
    R: -2,
    N: -2,
    D: -1,
    C: -3,
    Q: -1,
    E: -1,
    G: -2,
    H: -2,
    I: -3,
    L: -3,
    K: -1,
    M: -2,
    F: -4,
    P: 7,
    S: -1,
    T: -1,
    W: -4,
    Y: -3,
    V: -2,
    B: -2,
    Z: -1,
    X: -2,
    '*': -4,
  },
  S: {
    A: 1,
    R: -1,
    N: 1,
    D: 0,
    C: -1,
    Q: 0,
    E: 0,
    G: 0,
    H: -1,
    I: -2,
    L: -2,
    K: 0,
    M: -1,
    F: -2,
    P: -1,
    S: 4,
    T: 1,
    W: -3,
    Y: -2,
    V: -2,
    B: 0,
    Z: 0,
    X: 0,
    '*': -4,
  },
  T: {
    A: 0,
    R: -1,
    N: 0,
    D: -1,
    C: -1,
    Q: -1,
    E: -1,
    G: -2,
    H: -2,
    I: -1,
    L: -1,
    K: -1,
    M: -1,
    F: -2,
    P: -1,
    S: 1,
    T: 5,
    W: -2,
    Y: -2,
    V: 0,
    B: -1,
    Z: -1,
    X: 0,
    '*': -4,
  },
  W: {
    A: -3,
    R: -3,
    N: -4,
    D: -4,
    C: -2,
    Q: -2,
    E: -3,
    G: -2,
    H: -2,
    I: -3,
    L: -2,
    K: -3,
    M: -1,
    F: 1,
    P: -4,
    S: -3,
    T: -2,
    W: 11,
    Y: 2,
    V: -3,
    B: -4,
    Z: -3,
    X: -2,
    '*': -4,
  },
  Y: {
    A: -2,
    R: -2,
    N: -2,
    D: -3,
    C: -2,
    Q: -1,
    E: -2,
    G: -3,
    H: 2,
    I: -1,
    L: -1,
    K: -2,
    M: -1,
    F: 3,
    P: -3,
    S: -2,
    T: -2,
    W: 2,
    Y: 7,
    V: -1,
    B: -3,
    Z: -2,
    X: -1,
    '*': -4,
  },
  V: {
    A: 0,
    R: -3,
    N: -3,
    D: -3,
    C: -1,
    Q: -2,
    E: -2,
    G: -3,
    H: -3,
    I: 3,
    L: 1,
    K: -2,
    M: 1,
    F: -1,
    P: -2,
    S: -2,
    T: 0,
    W: -3,
    Y: -1,
    V: 4,
    B: -3,
    Z: -2,
    X: -1,
    '*': -4,
  },
  B: {
    A: -2,
    R: -1,
    N: 3,
    D: 4,
    C: -3,
    Q: 0,
    E: 1,
    G: -1,
    H: 0,
    I: -3,
    L: -4,
    K: 0,
    M: -3,
    F: -3,
    P: -2,
    S: 0,
    T: -1,
    W: -4,
    Y: -3,
    V: -3,
    B: 4,
    Z: 1,
    X: -1,
    '*': -4,
  },
  Z: {
    A: -1,
    R: 0,
    N: 0,
    D: 1,
    C: -3,
    Q: 3,
    E: 4,
    G: -2,
    H: 0,
    I: -3,
    L: -3,
    K: 1,
    M: -1,
    F: -3,
    P: -1,
    S: 0,
    T: -1,
    W: -3,
    Y: -2,
    V: -2,
    B: 1,
    Z: 4,
    X: -1,
    '*': -4,
  },
  X: {
    A: 0,
    R: -1,
    N: -1,
    D: -1,
    C: -2,
    Q: -1,
    E: -1,
    G: -1,
    H: -1,
    I: -1,
    L: -1,
    K: -1,
    M: -1,
    F: -1,
    P: -2,
    S: 0,
    T: 0,
    W: -2,
    Y: -1,
    V: -1,
    B: -1,
    Z: -1,
    X: -1,
    '*': -4,
  },
  '*': {
    A: -4,
    R: -4,
    N: -4,
    D: -4,
    C: -4,
    Q: -4,
    E: -4,
    G: -4,
    H: -4,
    I: -4,
    L: -4,
    K: -4,
    M: -4,
    F: -4,
    P: -4,
    S: -4,
    T: -4,
    W: -4,
    Y: -4,
    V: -4,
    B: -4,
    Z: -4,
    X: -4,
    '*': 1,
  },
}

function getScore(a: string, b: string) {
  const upper_a = a.toUpperCase()
  const upper_b = b.toUpperCase()
  return BLOSUM62[upper_a]?.[upper_b] ?? -4
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
  let consensus = ''
  for (let i = 0; i < alignedSeq1.length; i++) {
    const a = alignedSeq1[i]!
    const b = alignedSeq2[i]!
    if (a === '-' || b === '-') {
      consensus += ' '
    } else if (a.toUpperCase() === b.toUpperCase()) {
      consensus += '|'
    } else {
      consensus += ' '
    }
  }
  return consensus
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
