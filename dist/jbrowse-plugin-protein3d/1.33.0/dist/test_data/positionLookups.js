import { alignmentCol, structurePos, transcriptPos } from 'p2s_mapper';
// A CoordinateMapper conversion from a literal table, for a test that names
// the few positions it maps rather than building an alignment
export function toStructure(map) {
    return p => {
        const v = map[p];
        return v === undefined ? undefined : structurePos(v);
    };
}
export function toTranscript(map) {
    return p => {
        const v = map[p];
        return v === undefined ? undefined : transcriptPos(v);
    };
}
export function toAlignment(map) {
    return p => {
        const v = map[p];
        return v === undefined ? undefined : alignmentCol(v);
    };
}
export function alignmentToStructure(map) {
    return c => {
        const v = map[c];
        return v === undefined ? undefined : structurePos(v);
    };
}
