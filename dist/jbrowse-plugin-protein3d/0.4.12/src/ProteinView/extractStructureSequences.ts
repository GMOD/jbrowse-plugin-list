interface StructureModel {
  obj?: {
    data: {
      sequence: {
        sequences: readonly {
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

export function extractStructureSequences(
  model: StructureModel,
): string[] | undefined {
  return model.obj?.data.sequence.sequences.map(s =>
    Array.from(s.sequence.label.toArray()).join(''),
  )
}
