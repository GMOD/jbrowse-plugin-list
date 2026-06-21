// Kyte-Doolittle hydropathy index. Positive = hydrophobic, negative =
// hydrophilic. Residues absent from the table (X, gaps, non-standard) map to
// undefined so they render as gaps in the track.
const KYTE_DOOLITTLE = {
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
};
export const KYTE_DOOLITTLE_MIN = -4.5;
export const KYTE_DOOLITTLE_MAX = 4.5;
export function kyteDoolittleScores(seq) {
    return Array.from(seq, aa => KYTE_DOOLITTLE[aa]);
}
/**
 * AlphaFold pLDDT confidence palette (matches molstar's plddt-confidence
 * color theme): very low (<=50) orange, low (<=70) yellow, confident (<=90)
 * light blue, very high (>90) blue.
 */
export function plddtColor(score) {
    return score < 0
        ? '#cccccc'
        : score <= 50
            ? '#ff7d45'
            : score <= 70
                ? '#ffdb13'
                : score <= 90
                    ? '#65cbf3'
                    : '#0053d6';
}
/**
 * Diverging hydrophobicity color: hydrophobic (high Kyte-Doolittle) toward
 * orange, hydrophilic (low) toward blue, near-neutral white.
 */
export function hydrophobicityColor(score) {
    const t = Math.max(0, Math.min(1, (score - KYTE_DOOLITTLE_MIN) / (KYTE_DOOLITTLE_MAX - KYTE_DOOLITTLE_MIN)));
    // t=0 hydrophilic (blue 51,102,204) -> t=1 hydrophobic (orange 230,140,40)
    const r = Math.round(51 + (230 - 51) * t);
    const g = Math.round(102 + (140 - 102) * t);
    const b = Math.round(204 + (40 - 204) * t);
    return `rgb(${r}, ${g}, ${b})`;
}
/**
 * Maps per-structure-residue values (indexed by 0-based structure sequence
 * position) onto alignment columns via structurePositionToAlignmentMap.
 * Residues with no value or no alignment column (gaps) are dropped.
 */
export function mapResidueValuesToColumns(values, structurePositionToAlignmentMap) {
    return structurePositionToAlignmentMap
        ? values.flatMap((value, structurePos) => {
            const col = structurePositionToAlignmentMap[structurePos];
            return value !== undefined && col !== undefined ? [{ col, value }] : [];
        })
        : [];
}
