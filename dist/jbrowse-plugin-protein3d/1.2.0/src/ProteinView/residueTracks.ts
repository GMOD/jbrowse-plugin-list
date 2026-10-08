// Kyte-Doolittle hydropathy index. Positive = hydrophobic, negative =
// hydrophilic. Residues absent from the table (X, gaps, non-standard) map to
// undefined so they render as gaps in the track.
const KYTE_DOOLITTLE: Record<string, number> = {
  I: 4.5,
  V: 4.2,
  L: 3.8,
  F: 2.8,
  C: 2.5,
  M: 1.9,
  A: 1.8,
  G: -0.4,
  T: -0.7,
  S: -0.8,
  W: -0.9,
  Y: -1.3,
  P: -1.6,
  H: -3.2,
  E: -3.5,
  Q: -3.5,
  D: -3.5,
  N: -3.5,
  K: -3.9,
  R: -4.5,
}

const KYTE_DOOLITTLE_MIN = -4.5
const KYTE_DOOLITTLE_MAX = 4.5

export function kyteDoolittle(aa: string): number | undefined {
  return KYTE_DOOLITTLE[aa]
}

export function kyteDoolittleScores(seq: string): (number | undefined)[] {
  return Array.from(seq, kyteDoolittle)
}

/**
 * A threshold scale: a value up to and including `upTo` takes that band's
 * colour. The last band's `upTo` is Infinity.
 */
export interface Band {
  upTo: number
  color: string
  label: string
}

/**
 * AlphaFold's pLDDT bands, as Mol*'s plddt-confidence theme paints them. The
 * alignment strip, its legend and the linear confidence track all read these.
 */
export const PLDDT_BANDS: Band[] = [
  { upTo: 50, color: '#ff7d45', label: 'very low <50' },
  { upTo: 70, color: '#ffdb13', label: 'low 50-70' },
  { upTo: 90, color: '#65cbf3', label: 'confident 70-90' },
  { upTo: Infinity, color: '#0053d6', label: 'very high >90' },
]

export function bandColor(bands: Band[], value: number) {
  return bands.find(band => value <= band.upTo)?.color
}

export function plddtColor(score: number): string {
  return (score < 0 ? undefined : bandColor(PLDDT_BANDS, score)) ?? '#cccccc'
}

const HYDROPHILIC_RGB = [51, 102, 204] as const
const NEUTRAL_RGB = [247, 247, 247] as const
const HYDROPHOBIC_RGB = [230, 140, 40] as const

/**
 * Diverging Kyte-Doolittle palette shared by the alignment strip and the 3D
 * theme: hydrophilic blue, neutral (0) near-white, hydrophobic orange.
 */
export function hydrophobicityRgb(score: number): [number, number, number] {
  const t = Math.max(-1, Math.min(1, score / KYTE_DOOLITTLE_MAX))
  const end = t < 0 ? HYDROPHILIC_RGB : HYDROPHOBIC_RGB
  const mix = (i: 0 | 1 | 2) =>
    Math.round(NEUTRAL_RGB[i] + (end[i] - NEUTRAL_RGB[i]) * Math.abs(t))
  return [mix(0), mix(1), mix(2)]
}

export function hydrophobicityColor(score: number): string {
  const [r, g, b] = hydrophobicityRgb(score)
  return `rgb(${r}, ${g}, ${b})`
}

export const HYDROPHOBICITY_KEY_SCORES = [
  KYTE_DOOLITTLE_MIN,
  0,
  KYTE_DOOLITTLE_MAX,
]

/**
 * Maps per-structure-residue values (indexed by 0-based structure sequence
 * position) onto alignment columns via structurePositionToAlignmentMap.
 * Residues with no value or no alignment column (gaps) are dropped.
 */
export function mapResidueValuesToColumns(
  values: (number | undefined)[],
  structurePositionToAlignmentMap: Record<number, number> | undefined,
): { col: number; value: number }[] {
  return structurePositionToAlignmentMap
    ? values.flatMap((value, structurePos) => {
        const col = structurePositionToAlignmentMap[structurePos]
        return value !== undefined && col !== undefined ? [{ col, value }] : []
      })
    : []
}
