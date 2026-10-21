export const VARIANT_EFFECT_SCHEMES = [
    'alphamissense',
    'clinvar',
    'genome-track',
];
export const VARIANT_EFFECT_SOURCE_NAMES = {
    alphamissense: 'AlphaMissense scores',
    clinvar: 'ClinVar variants',
    'genome-track': 'Genome track scores',
};
/**
 * A source that answered, but with values that would mislead, such as a VCF
 * read against the wrong build. Its message is the whole explanation.
 */
export class VariantEffectRefusal extends Error {
}
/**
 * The mean AlphaMissense pathogenicity of every substitution at each residue,
 * the per-residue figure AlphaFold DB colors its models by. The sequence is
 * spelled from each row's reference residue, `X` where no row names one.
 */
export function meanScoreByPosition(rows) {
    const sums = new Map();
    const residues = [];
    for (const { start, score, ref } of rows) {
        residues[start] = ref;
        const sum = sums.get(start + 1);
        if (sum) {
            sum.total += score;
            sum.count++;
        }
        else {
            sums.set(start + 1, { total: score, count: 1 });
        }
    }
    return {
        numbering: 'uniprot',
        sequence: Array.from(residues, r => r ?? 'X').join(''),
        byPosition: new Map([...sums].map(([position, { total, count }]) => [
            position,
            total / count,
        ])),
    };
}
/**
 * Carries a source's per-position values onto one entity's residues through
 * `toStructurePosition`, which places only what it can: a residue the map
 * does not reach gets no value rather than a neighbour's.
 */
export function placeValues(byPosition, toStructurePosition, entity) {
    const byLabelSeqId = new Map();
    for (const [position, value] of byPosition) {
        const structurePos = toStructurePosition(position);
        const labelSeqId = structurePos === undefined ? undefined : entity.seqIds[structurePos];
        if (labelSeqId !== undefined) {
            byLabelSeqId.set(labelSeqId, value);
        }
    }
    return { entityId: entity.entityId, byLabelSeqId };
}
