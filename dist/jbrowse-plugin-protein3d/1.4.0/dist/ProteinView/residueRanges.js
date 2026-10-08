import { residueNumber } from 'p2s_mapper';
export function rangeList(ranges) {
    return ranges === undefined ? [] : 'start' in ranges ? [ranges] : ranges;
}
/**
 * Collapse a set of positions into sorted, contiguous [start, end) runs.
 */
export function positionRuns(positions) {
    const sorted = [...new Set(positions)].sort((a, b) => a - b);
    const runs = [];
    for (const pos of sorted) {
        const last = runs.at(-1);
        if (last?.end === pos) {
            last.end = pos + 1;
        }
        else {
            runs.push({ start: pos, end: pos + 1 });
        }
    }
    return runs;
}
/**
 * The runs of positions whose author number falls in any of the ranges. A
 * fusion numbers its partner apart (2RH1's lysozyme is 1002–1161), so a range
 * across the fusion site selects the receptor on both sides and not the
 * partner between.
 */
export function residueRuns(entity, ranges) {
    const list = rangeList(ranges);
    const positions = [];
    for (let pos = 0; pos < (entity?.seq.length ?? 0); pos++) {
        const n = residueNumber(entity, pos);
        if (list.some(r => n >= r.start && n <= r.end)) {
            positions.push(pos);
        }
    }
    return positionRuns(positions);
}
/**
 * The runs of structure positions the alignment pairs with any of the
 * transcript ranges. A structure residue the transcript lacks, an inserted tag
 * or a fusion partner SIFTS unmaps, splits the run rather than being selected.
 */
export function transcriptRuns(mapper, ranges) {
    const list = rangeList(ranges);
    const positions = [];
    for (const [transcript, structure] of Object.entries(mapper.maps.transcriptSeqToStructureSeqPosition)) {
        const residue = Number(transcript) + 1;
        if (list.some(r => residue >= r.start && residue <= r.end)) {
            positions.push(structure);
        }
    }
    return positionRuns(positions);
}
/** Sorted [start, end) runs covering the ranges, overlaps and neighbours merged. */
export function positionRangeRuns(ranges) {
    const runs = [];
    for (const { start, end } of rangeList(ranges)
        .filter(r => r.end > r.start)
        .toSorted((a, b) => a.start - b.start)) {
        const last = runs.at(-1);
        if (last && start <= last.end) {
            last.end = Math.max(last.end, end);
        }
        else {
            runs.push({ start, end });
        }
    }
    return runs;
}
