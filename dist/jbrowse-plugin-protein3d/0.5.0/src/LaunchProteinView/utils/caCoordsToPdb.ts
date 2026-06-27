// 3-letter amino acid codes
const AA_3LETTER: Record<string, string> = {
  A: 'ALA',
  C: 'CYS',
  D: 'ASP',
  E: 'GLU',
  F: 'PHE',
  G: 'GLY',
  H: 'HIS',
  I: 'ILE',
  K: 'LYS',
  L: 'LEU',
  M: 'MET',
  N: 'ASN',
  P: 'PRO',
  Q: 'GLN',
  R: 'ARG',
  S: 'SER',
  T: 'THR',
  V: 'VAL',
  W: 'TRP',
  Y: 'TYR',
  X: 'UNK', // Unknown
}

function padLeft(str: string, len: number) {
  return str.padStart(len, ' ')
}

function padRight(str: string, len: number) {
  return str.padEnd(len, ' ')
}

function formatCoord(val: number) {
  return val.toFixed(3).padStart(8, ' ')
}

/**
 * Convert Foldseek tCa coordinates and tSeq to PDB format
 * tCa is a comma-separated string of x,y,z triplets
 * tSeq is the amino acid sequence
 */
export function caCoordsToPdb(
  tCa: string,
  tSeq: string,
  chainId = 'A',
  title?: string,
) {
  const coords = tCa.split(',').map(Number)
  const lines: string[] = []

  // Add header
  if (title) {
    lines.push(`TITLE     ${title}`)
  }
  lines.push('REMARK   1 Generated from Foldseek Cα coordinates')

  let atomNum = 1
  let resNum = 1

  for (let i = 0; i < coords.length - 2; i += 3) {
    const x = coords[i]
    const y = coords[i + 1]
    const z = coords[i + 2]
    const aa = tSeq[resNum - 1] ?? 'X'
    const resName = AA_3LETTER[aa] ?? 'UNK'

    if (x === undefined || y === undefined || z === undefined) {
      break
    }

    // PDB ATOM record format
    // Columns: 1-6 "ATOM  ", 7-11 serial, 13-16 name, 17 altLoc, 18-20 resName,
    // 22 chainID, 23-26 resSeq, 27 iCode, 31-38 x, 39-46 y, 47-54 z,
    // 55-60 occupancy, 61-66 tempFactor, 77-78 element
    const line =
      'ATOM  ' +
      padLeft(String(atomNum), 5) +
      '  CA  ' +
      padRight(resName, 3) +
      ' ' +
      chainId +
      padLeft(String(resNum), 4) +
      '    ' +
      formatCoord(x) +
      formatCoord(y) +
      formatCoord(z) +
      '  1.00  0.00           C'

    lines.push(line)
    atomNum++
    resNum++
  }

  lines.push('END')

  return lines.join('\n')
}

/**
 * Check if a hit has valid tCa data that can be converted to PDB
 */
export function hasValidCaCoords(tCa?: string, tSeq?: string) {
  if (!tCa || !tSeq) {
    return false
  }
  const coords = tCa.split(',')
  // Need at least 3 coordinates (x,y,z for one residue) and matching sequence
  return coords.length >= 3 && tSeq.length > 0
}
