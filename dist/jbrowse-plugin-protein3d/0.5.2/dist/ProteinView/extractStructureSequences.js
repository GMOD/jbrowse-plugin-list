export function extractStructureSequences(model) {
    return model.obj?.data.sequence.sequences.map(s => Array.from(s.sequence.label.toArray()).join(''));
}
