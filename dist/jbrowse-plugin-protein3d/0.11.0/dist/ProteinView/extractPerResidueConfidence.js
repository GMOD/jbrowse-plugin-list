export function extractPerResidueConfidence(model) {
    const data = model.obj?.data;
    if (!data) {
        return undefined;
    }
    const { B_iso_or_equiv } = data.atomicConformation;
    const { residueAtomSegments, chainAtomSegments, chains, residues } = data.atomicHierarchy;
    const byEntity = new Map();
    for (let residue = 0; residue < residueAtomSegments.count; residue++) {
        const atom = residueAtomSegments.offsets[residue];
        const entityId = chains.label_entity_id.value(chainAtomSegments.index[atom]);
        let values = byEntity.get(entityId);
        if (!values) {
            values = new Map();
            byEntity.set(entityId, values);
        }
        const seqId = residues.label_seq_id.value(residue);
        if (!values.has(seqId)) {
            values.set(seqId, B_iso_or_equiv.value(atom));
        }
    }
    return [...byEntity].map(([entityId, byLabelSeqId]) => ({
        entityId,
        byLabelSeqId,
    }));
}
/**
 * AlphaFold-style pLDDT lives in [0, 100] and varies across residues. A
 * constant column (common when a PDB has no B-factors) or out-of-range values
 * indicate the track wouldn't be meaningful as confidence.
 */
export function looksLikePlddt(values) {
    return (!!values &&
        values.length > 1 &&
        values.every(v => v >= 0 && v <= 100) &&
        new Set(values).size > 1);
}
