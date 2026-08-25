export function extractEntities(model) {
    return model.obj?.data.sequence.sequences.map(s => ({
        entityId: s.entityId,
        seq: Array.from(s.sequence.label.toArray()).join(''),
        seqIds: Array.from(s.sequence.seqId.toArray()),
    }));
}
/** Back-compat helper for callers that only need the sequence strings (e.g. the
 * launch dialog's isoform matching). */
export function extractStructureSequences(model) {
    return extractEntities(model)?.map(e => e.seq);
}
/**
 * The molstar `label_seq_id`s for a set of 0-based structure positions. Unknown
 * positions are dropped rather than guessed, so an out-of-range position paints
 * nothing instead of painting something wrong.
 */
export function toLabelSeqIds(entity, positions) {
    if (!entity) {
        return [];
    }
    const out = [];
    for (const pos of positions) {
        const id = entity.seqIds[pos];
        if (id !== undefined) {
            out.push(id);
        }
    }
    return out;
}
/** As toLabelSeqIds, for a half-open [start, end) structure-position range. */
export function rangeToLabelSeqIds(entity, range) {
    if (!entity || !range) {
        return [];
    }
    const start = Math.max(0, range.start);
    const end = Math.min(entity.seqIds.length, range.end);
    return end > start ? entity.seqIds.slice(start, end) : [];
}
/** Reverse of `seqIds`: molstar's label_seq_id -> 0-based structure position. */
export function makeLabelSeqIdIndex(entity) {
    const index = new Map();
    entity?.seqIds.forEach((id, pos) => {
        // first wins: duplicate ids (micro-heterogeneity) collapse to one residue
        if (!index.has(id)) {
            index.set(id, pos);
        }
    });
    return index;
}
