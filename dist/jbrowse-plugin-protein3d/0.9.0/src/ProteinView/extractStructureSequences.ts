/** A polymer entity of a loaded structure: its mmCIF entity id, its one-letter
 * sequence, and the molstar `label_seq_id` of each of those residues.
 *
 * The entity id is what lets every downstream step talk about "the gene's
 * protein" by identity instead of by the fragile entity-[0] position.
 *
 * `seqIds` is what lets it talk about a *residue* by identity. Structure
 * positions in this plugin are 0-based indices into `seq`; molstar addresses
 * residues by `label_seq_id`. Those are related by `+1` only when the entity's
 * sequence covers every residue from 1 — true for any mmCIF with an
 * `entity_poly_seq` category (all of RCSB and AlphaFold) and for PDB files
 * carrying SEQRES records, because molstar synthesizes the category from them.
 *
 * A PDB-format file with no SEQRES has no such category, so molstar falls back
 * to `StructureSequence.fromHierarchy` and takes `label_seq_id` straight from
 * the observed residues' author numbering: a chain whose coordinates start at
 * residue 94 yields seqIds 94.., and an unobserved loop leaves a hole. Deriving
 * the id arithmetically there is off by the whole offset, in both directions —
 * every hover reads the wrong residue and every highlight paints the wrong one.
 * So carry the real ids and convert through them.
 */
export interface Entity {
  entityId: string
  seq: string
  seqIds: number[]
}

interface StructureModel {
  obj?: {
    data: {
      sequence: {
        sequences: readonly {
          entityId: string
          sequence: {
            label: {
              toArray(): ArrayLike<string>
            }
            seqId: {
              toArray(): ArrayLike<number>
            }
          }
        }[]
      }
    }
  }
}

export function extractEntities(model: StructureModel): Entity[] | undefined {
  return model.obj?.data.sequence.sequences.map(s => ({
    entityId: s.entityId,
    seq: Array.from(s.sequence.label.toArray()).join(''),
    seqIds: Array.from(s.sequence.seqId.toArray()),
  }))
}

/** Back-compat helper for callers that only need the sequence strings (e.g. the
 * launch dialog's isoform matching). */
export function extractStructureSequences(
  model: StructureModel,
): string[] | undefined {
  return extractEntities(model)?.map(e => e.seq)
}

/**
 * The molstar `label_seq_id`s for a set of 0-based structure positions. Unknown
 * positions are dropped rather than guessed, so an out-of-range position paints
 * nothing instead of painting something wrong.
 */
export function toLabelSeqIds(
  entity: Entity | undefined,
  positions: Iterable<number>,
): number[] {
  if (!entity) {
    return []
  }
  const out: number[] = []
  for (const pos of positions) {
    const id = entity.seqIds[pos]
    if (id !== undefined) {
      out.push(id)
    }
  }
  return out
}

/** As toLabelSeqIds, for a half-open [start, end) structure-position range. */
export function rangeToLabelSeqIds(
  entity: Entity | undefined,
  range: { start: number; end: number } | undefined,
): number[] {
  if (!entity || !range) {
    return []
  }
  const start = Math.max(0, range.start)
  const end = Math.min(entity.seqIds.length, range.end)
  return end > start ? entity.seqIds.slice(start, end) : []
}

/** Reverse of `seqIds`: molstar's label_seq_id -> 0-based structure position. */
export function makeLabelSeqIdIndex(entity: Entity | undefined) {
  const index = new Map<number, number>()
  entity?.seqIds.forEach((id, pos) => {
    // first wins: duplicate ids (micro-heterogeneity) collapse to one residue
    if (!index.has(id)) {
      index.set(id, pos)
    }
  })
  return index
}
