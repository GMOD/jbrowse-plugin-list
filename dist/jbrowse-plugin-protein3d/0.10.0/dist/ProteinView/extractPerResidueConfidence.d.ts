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
                chainAtomSegments: {
                    index: ArrayLike<number>;
                };
                chains: {
                    label_entity_id: {
                        value: (row: number) => string;
                    };
                };
                residues: {
                    label_seq_id: {
                        value: (row: number) => number;
                    };
                };
            };
        };
    };
}
/**
 * Per-residue B-factor / pLDDT of one polymer entity, keyed by molstar's
 * `label_seq_id`. Keyed by id rather than by residue order because the atomic
 * hierarchy only holds *observed* residues: a chain with an unmodeled loop, or
 * a chain that is not the first in the file, would otherwise plot every value
 * against the wrong SEQRES position. Convert through `Entity.seqIds`.
 */
export interface EntityConfidence {
    entityId: string;
    byLabelSeqId: Map<number, number>;
}
export declare function extractPerResidueConfidence(model: ConfidenceModel): EntityConfidence[] | undefined;
/**
 * AlphaFold-style pLDDT lives in [0, 100] and varies across residues. A
 * constant column (common when a PDB has no B-factors) or out-of-range values
 * indicate the track wouldn't be meaningful as confidence.
 */
export declare function looksLikePlddt(values: number[] | undefined): values is number[];
export {};
