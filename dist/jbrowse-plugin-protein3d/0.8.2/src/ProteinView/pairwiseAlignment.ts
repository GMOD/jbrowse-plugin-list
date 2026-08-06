import type { PairwiseAlignment } from '../mappings'
import type { AlignmentAlgorithm } from './types'

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

// Score of a residue pair that isn't in the matrix at all.
const UNKNOWN_PAIR_SCORE = -4

// The DP reads the matrix once per cell, so both the residue→row lookup and the
// matrix itself are flat typed arrays keyed by char code: charCodeToRow maps
// 'a'/'A' to the same row, and unknown residues to -1 (scored as unknown).
const N_AA = AMINO_ACIDS.length
const charCodeToRow = new Int8Array(128).fill(-1)
for (let i = 0; i < N_AA; i++) {
  const aa = AMINO_ACIDS[i]!
  charCodeToRow[aa.charCodeAt(0)] = i
  charCodeToRow[aa.toLowerCase().charCodeAt(0)] = i
}
const BLOSUM62 = new Int8Array(N_AA * N_AA)
for (let i = 0; i < N_AA; i++) {
  for (let j = 0; j < N_AA; j++) {
    BLOSUM62[i * N_AA + j] = BLOSUM62_RAW[i]![j]!
  }
}

const rowOf = (c: string) => {
  const code = c.charCodeAt(0)
  return code < 128 ? charCodeToRow[code]! : -1
}

function getScore(a: string, b: string) {
  const i = rowOf(a)
  const j = rowOf(b)
  return i < 0 || j < 0 ? UNKNOWN_PAIR_SCORE : BLOSUM62[i * N_AA + j]!
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
 * Ceiling on the dynamic-programming table, in cells. Both algorithms are
 * O(m*n) time and hold one byte of traceback per cell, so this bounds the
 * alignment at ~40 MB and roughly a second of main-thread work. Without it a
 * titin-sized transcript or a long nucleic-acid chain locks up or OOMs the tab.
 * Callers that have several candidates to align should check `alignmentTooLarge`
 * and skip the oversized ones rather than let this throw.
 */
export const MAX_ALIGNMENT_CELLS = 40_000_000

export function alignmentTooLarge(len1: number, len2: number) {
  return (len1 + 1) * (len2 + 1) > MAX_ALIGNMENT_CELLS
}

function assertAlignable(len1: number, len2: number) {
  if (alignmentTooLarge(len1, len2)) {
    throw new Error(
      `Sequences too long to align (${len1} x ${len2} residues exceeds the ${MAX_ALIGNMENT_CELLS} cell limit)`,
    )
  }
}

// Traceback states. Each cell stores, for each of the three matrices, which
// matrix its best predecessor came from — 2 bits per matrix, packed into one
// byte. Storing pointers instead of re-deriving them by comparing scores keeps
// traceback exact under Float32 rounding and lets the score matrices collapse
// to two rows.
const FROM_M = 0
const FROM_IX = 1
const FROM_IY = 2
// Smith-Waterman only: the local alignment restarts here, so traceback stops.
const FROM_NONE = 3

const M_SHIFT = 0
const IX_SHIFT = 2
const IY_SHIFT = 4

type Matrix = typeof FROM_M | typeof FROM_IX | typeof FROM_IY
type Pointer = Matrix | typeof FROM_NONE

const readPointer = (trace: Uint8Array, at: number, shift: number): Pointer =>
  ((trace[at]! >> shift) & 0b11) as Pointer

interface FilledMatrices {
  trace: Uint8Array
  width: number
  score: number
  /** cell the traceback starts from: (m, n) for global, the best cell for local */
  startI: number
  startJ: number
  startMatrix: Matrix
}

/**
 * Fill the affine-gap DP tables for both algorithms; `local` switches
 * Needleman-Wunsch (global, ends at the corner) to Smith-Waterman (restarts at
 * 0, ends at the best-scoring cell). Only the previous and current score rows
 * are kept — the full traceback lives in the packed `trace` byte array.
 */
function fillMatrices(
  seq1: string,
  seq2: string,
  gapOpen: number,
  gapExtend: number,
  local: boolean,
): FilledMatrices {
  const m = seq1.length
  const n = seq2.length
  assertAlignable(m, n)
  const width = n + 1
  const trace = new Uint8Array((m + 1) * width)

  // Row 0. Global: only M[0][0] is reachable and Iy[0][j] is the leading-gap
  // base case. Local: M starts at 0 everywhere, gaps are unreachable.
  let prevM = new Float32Array(width)
  let prevIx = new Float32Array(width).fill(-Infinity)
  let prevIy = new Float32Array(width).fill(-Infinity)
  let curM = new Float32Array(width)
  let curIx = new Float32Array(width)
  let curIy = new Float32Array(width)
  if (!local) {
    prevM.fill(-Infinity)
    prevM[0] = 0
    for (let j = 1; j <= n; j++) {
      prevIy[j] = gapOpen + (j - 1) * gapExtend
    }
  }

  let bestScore = local ? 0 : -Infinity
  let bestI = 0
  let bestJ = 0
  let bestMatrix: Matrix = FROM_M

  // Resolve seq2 to matrix rows once instead of once per cell.
  const cols = new Int8Array(n)
  for (let j = 0; j < n; j++) {
    cols[j] = rowOf(seq2[j]!)
  }

  for (let i = 1; i <= m; i++) {
    // Column 0, mirroring row 0.
    curM[0] = local ? 0 : -Infinity
    curIx[0] = local ? -Infinity : gapOpen + (i - 1) * gapExtend
    curIy[0] = -Infinity
    const rowBase = i * width
    const scoreRow = rowOf(seq1[i - 1]!)
    const scoreBase = scoreRow * N_AA

    for (let j = 1; j <= n; j++) {
      const col = cols[j - 1]!
      const matchScore =
        scoreRow < 0 || col < 0
          ? UNKNOWN_PAIR_SCORE
          : BLOSUM62[scoreBase + col]!

      const dM = prevM[j - 1]!
      const dIx = prevIx[j - 1]!
      const dIy = prevIy[j - 1]!
      // Ties resolve M > Ix > Iy, matching the previous implementation.
      const bestDiag = Math.max(dM, dIx, dIy)
      const diagFrom =
        bestDiag === dM ? FROM_M : bestDiag === dIx ? FROM_IX : FROM_IY
      const mScore = bestDiag + matchScore
      const restart = local && mScore <= 0
      curM[j] = restart ? 0 : mScore

      const openIx = prevM[j]! + gapOpen
      const extendIx = prevIx[j]! + gapExtend
      curIx[j] = Math.max(openIx, extendIx)

      const openIy = curM[j - 1]! + gapOpen
      const extendIy = curIy[j - 1]! + gapExtend
      curIy[j] = Math.max(openIy, extendIy)

      trace[rowBase + j] =
        ((restart ? FROM_NONE : diagFrom) << M_SHIFT) |
        ((openIx >= extendIx ? FROM_M : FROM_IX) << IX_SHIFT) |
        ((openIy >= extendIy ? FROM_M : FROM_IY) << IY_SHIFT)

      if (local) {
        const cellMax = Math.max(curM[j]!, curIx[j]!, curIy[j]!)
        if (cellMax > bestScore) {
          bestScore = cellMax
          bestI = i
          bestJ = j
          bestMatrix =
            cellMax === curM[j]!
              ? FROM_M
              : cellMax === curIx[j]!
                ? FROM_IX
                : FROM_IY
        }
      }
    }

    ;[prevM, curM] = [curM, prevM]
    ;[prevIx, curIx] = [curIx, prevIx]
    ;[prevIy, curIy] = [curIy, prevIy]
  }

  if (local) {
    return {
      trace,
      width,
      score: bestScore,
      startI: bestI,
      startJ: bestJ,
      startMatrix: bestMatrix,
    }
  }
  // prev* now holds row m.
  const finalM = prevM[n]!
  const finalIx = prevIx[n]!
  const finalIy = prevIy[n]!
  const score = Math.max(finalM, finalIx, finalIy)
  return {
    trace,
    width,
    score,
    startI: m,
    startJ: n,
    startMatrix:
      score === finalM ? FROM_M : score === finalIx ? FROM_IX : FROM_IY,
  }
}

/**
 * Walk the packed traceback back to an edge. Rows are built back-to-front into
 * arrays and reversed once, rather than prepending onto a string per residue
 * (which is quadratic in the alignment length).
 */
function traceback(
  seq1: string,
  seq2: string,
  filled: FilledMatrices,
): AlignmentResult {
  const { trace, width, startI, startJ, score } = filled
  // Reversed: pushing here is prepending to the final string.
  const out1: string[] = []
  const out2: string[] = []

  // Residues past the aligned region (the whole sequences when the local
  // alignment is empty) hang off the end as gaps.
  for (let k = seq1.length; k > startI; k--) {
    out1.push(seq1[k - 1]!)
    out2.push('-')
  }
  for (let k = seq2.length; k > startJ; k--) {
    out1.push('-')
    out2.push(seq2[k - 1]!)
  }

  let i = startI
  let j = startJ
  let matrix: Pointer = filled.startMatrix
  while (i > 0 && j > 0) {
    const at = i * width + j
    if (matrix === FROM_M) {
      const next = readPointer(trace, at, M_SHIFT)
      if (next === FROM_NONE) {
        break
      }
      out1.push(seq1[i - 1]!)
      out2.push(seq2[j - 1]!)
      matrix = next
      i--
      j--
    } else if (matrix === FROM_IX) {
      out1.push(seq1[i - 1]!)
      out2.push('-')
      matrix = readPointer(trace, at, IX_SHIFT)
      i--
    } else {
      out1.push('-')
      out2.push(seq2[j - 1]!)
      matrix = readPointer(trace, at, IY_SHIFT)
      j--
    }
  }

  // Whatever is left runs into an edge, so it can only be gaps.
  while (i > 0) {
    out1.push(seq1[i - 1]!)
    out2.push('-')
    i--
  }
  while (j > 0) {
    out1.push('-')
    out2.push(seq2[j - 1]!)
    j--
  }

  return {
    alignedSeq1: out1.reverse().join(''),
    alignedSeq2: out2.reverse().join(''),
    score,
  }
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
  return traceback(
    seq1,
    seq2,
    fillMatrices(seq1, seq2, gapOpen, gapExtend, false),
  )
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
  return traceback(
    seq1,
    seq2,
    fillMatrices(seq1, seq2, gapOpen, gapExtend, true),
  )
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

export function runLocalAlignment(
  seq1: string,
  seq2: string,
  algorithm: AlignmentAlgorithm,
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
