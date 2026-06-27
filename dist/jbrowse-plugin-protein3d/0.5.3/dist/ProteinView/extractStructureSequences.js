export function extractEntities(model) {
    return model.obj?.data.sequence.sequences.map(s => ({
        entityId: s.entityId,
        seq: Array.from(s.sequence.label.toArray()).join(''),
    }));
}
/** Back-compat helper for callers that only need the sequence strings (e.g. the
 * launch dialog's isoform matching). */
export function extractStructureSequences(model) {
    return extractEntities(model)?.map(e => e.seq);
}
