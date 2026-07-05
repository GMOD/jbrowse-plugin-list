/** A polymer entity of a loaded structure: its mmCIF entity id and its full
 * (label_seq_id-indexed) one-letter sequence. The entity id is what lets every
 * downstream step talk about "the gene's protein" by identity instead of by the
 * fragile entity-[0] position. */
export interface Entity {
  entityId: string
  seq: string
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
  }))
}

/** Back-compat helper for callers that only need the sequence strings (e.g. the
 * launch dialog's isoform matching). */
export function extractStructureSequences(
  model: StructureModel,
): string[] | undefined {
  return extractEntities(model)?.map(e => e.seq)
}
