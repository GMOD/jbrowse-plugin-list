export declare const KYTE_DOOLITTLE_MIN = -4.5;
export declare const KYTE_DOOLITTLE_MAX = 4.5;
export declare function kyteDoolittleScores(seq: string): (number | undefined)[];
/**
 * AlphaFold pLDDT confidence palette (matches molstar's plddt-confidence
 * color theme): very low (<=50) orange, low (<=70) yellow, confident (<=90)
 * light blue, very high (>90) blue.
 */
export declare function plddtColor(score: number): string;
/**
 * Diverging hydrophobicity color: hydrophobic (high Kyte-Doolittle) toward
 * orange, hydrophilic (low) toward blue, near-neutral white.
 */
export declare function hydrophobicityColor(score: number): string;
/**
 * Maps per-structure-residue values (indexed by 0-based structure sequence
 * position) onto alignment columns via structurePositionToAlignmentMap.
 * Residues with no value or no alignment column (gaps) are dropped.
 */
export declare function mapResidueValuesToColumns(values: (number | undefined)[], structurePositionToAlignmentMap: Record<number, number> | undefined): {
    col: number;
    value: number;
}[];
