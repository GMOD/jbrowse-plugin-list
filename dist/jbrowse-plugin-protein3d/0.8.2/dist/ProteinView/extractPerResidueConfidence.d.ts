interface ConfidenceModel {
    obj?: {
        data: {
            atomicConformation: {
                B_iso_or_equiv: {
                    value: (row: number) => number;
                };
            };
            atomicHierarchy: {
                residueAtomSegments: {
                    offsets: ArrayLike<number>;
                    count: number;
                };
            };
        };
    };
}
/**
 * Per-residue B-factor / pLDDT, indexed by 0-based residue order (which aligns
 * with the structure's first-chain sequence for AlphaFold models). `maxLength`
 * caps the result to the structure sequence length so trailing chains/hetero
 * residues don't bleed in.
 */
export declare function extractPerResidueConfidence(model: ConfidenceModel, maxLength?: number): number[] | undefined;
/**
 * AlphaFold-style pLDDT lives in [0, 100] and varies across residues. A
 * constant column (common when a PDB has no B-factors) or out-of-range values
 * indicate the track wouldn't be meaningful as confidence.
 */
export declare function looksLikePlddt(values: number[] | undefined): values is number[];
export {};
