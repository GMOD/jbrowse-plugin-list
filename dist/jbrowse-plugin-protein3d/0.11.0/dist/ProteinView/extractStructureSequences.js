/** Observed residues' label_seq_id -> auth_seq_id, per entity. The first chain
 * carrying an entity wins, so a homodimer's copies agree. */
function authSeqIdsByEntity(model) {
    const hierarchy = model.obj?.data.atomicHierarchy;
    const byEntity = new Map();
    const { residues, residueAtomSegments, chainAtomSegments, chains } = hierarchy ?? {};
    if (!residues || !residueAtomSegments || !chainAtomSegments || !chains) {
        return undefined;
    }
    for (let residue = 0; residue < residueAtomSegments.count; residue++) {
        const atom = residueAtomSegments.offsets[residue];
        const entityId = chains.label_entity_id.value(chainAtomSegments.index[atom]);
        let ids = byEntity.get(entityId);
        if (!ids) {
            ids = new Map();
            byEntity.set(entityId, ids);
        }
        const labelSeqId = residues.label_seq_id.value(residue);
        if (!ids.has(labelSeqId)) {
            ids.set(labelSeqId, residues.auth_seq_id.value(residue));
        }
    }
    return byEntity;
}
/**
 * Author numbering for every SEQRES position, observed or not. A residue with
 * no atoms has no auth_seq_id of its own, so it takes the offset of the nearest
 * observed residue before it (after it, at an unobserved N-terminus): a
 * disordered loop keeps counting the way the paper does. With nothing observed
 * the label numbering stands.
 */
export function fillAuthSeqIds(seqIds, observed) {
    const out = [];
    let offset;
    const firstObserved = seqIds.find(id => observed?.has(id));
    if (firstObserved !== undefined) {
        offset = observed.get(firstObserved) - firstObserved;
    }
    for (const id of seqIds) {
        const auth = observed?.get(id);
        if (auth !== undefined) {
            offset = auth - id;
        }
        out.push(id + (offset ?? 0));
    }
    return out;
}
/** The number a residue is called by: author numbering when the file carries
 * it, else molstar's label_seq_id, which is the author numbering already for a
 * SEQRES-less PDB and 1..N for everything else. */
export function residueNumber(entity, pos) {
    return entity?.authSeqIds?.[pos] ?? entity?.seqIds[pos] ?? pos + 1;
}
/**
 * The 0-based half-open position range covering an inclusive range of author
 * residue numbers, the form a paper or a spec names a site by ("R248",
 * "residues 102-292"). Undefined when no residue of the entity carries a number
 * in the range, so a typo selects nothing rather than something else.
 */
export function residueRangeToPositions(entity, range) {
    if (!entity) {
        return undefined;
    }
    let first;
    let last;
    for (let pos = 0; pos < entity.seq.length; pos++) {
        const n = residueNumber(entity, pos);
        if (n >= range.start && n <= range.end) {
            first ??= pos;
            last = pos;
        }
    }
    return first === undefined || last === undefined
        ? undefined
        : { start: first, end: last + 1 };
}
function chainsByEntity(model) {
    const chains = model.obj?.data.atomicHierarchy?.chains;
    const byEntity = new Map();
    if (chains) {
        for (let i = 0; i < chains.label_entity_id.rowCount; i++) {
            const entityId = chains.label_entity_id.value(i);
            const chain = chains.auth_asym_id.value(i);
            const list = byEntity.get(entityId) ?? [];
            if (!list.includes(chain)) {
                list.push(chain);
            }
            byEntity.set(entityId, list);
        }
    }
    return byEntity;
}
// mmCIF entity_poly.type values for nucleic-acid polymers. Molstar derives the
// subtype from residue components when a file (PDB format) carries no
// entity_poly, so the flag is available for either format.
const NUCLEIC_ACID_SUBTYPES = new Set([
    'polydeoxyribonucleotide',
    'polyribonucleotide',
    'polydeoxyribonucleotide/polyribonucleotide hybrid',
    'peptide nucleic acid',
]);
function isNucleicAcid(model, entityId) {
    const entities = model.obj?.data.entities;
    if (!entities) {
        return false;
    }
    const index = entities.getEntityIndex(entityId);
    return index >= 0 && NUCLEIC_ACID_SUBTYPES.has(entities.subtype.value(index));
}
export function extractEntities(model) {
    const chains = chainsByEntity(model);
    const authIds = authSeqIdsByEntity(model);
    return model.obj?.data.sequence.sequences.map(s => {
        const seqIds = Array.from(s.sequence.seqId.toArray());
        return {
            entityId: s.entityId,
            seq: Array.from(s.sequence.label.toArray()).join(''),
            seqIds,
            chains: chains.get(s.entityId) ?? [],
            ...(isNucleicAcid(model, s.entityId) ? { nucleicAcid: true } : {}),
            ...(authIds
                ? { authSeqIds: fillAuthSeqIds(seqIds, authIds.get(s.entityId)) }
                : {}),
        };
    });
}
/** A user-facing name for an entity: its chains when known, else its id. */
export function entityLabel(entity) {
    const chains = entity.chains.length > 0
        ? `Chain ${entity.chains.join('/')}`
        : `Entity ${entity.entityId}`;
    return `${chains} (${entity.seq.length} ${entity.nucleicAcid ? 'nt' : 'aa'})`;
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
