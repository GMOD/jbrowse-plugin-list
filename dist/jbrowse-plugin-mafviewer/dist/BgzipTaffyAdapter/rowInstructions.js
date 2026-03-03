// Faithfully replicates change_s_coordinates_to_i from taffy/impl/tai.c
// When starting from an indexed position:
// 1. Convert 's' (substitute) to 'i' (insert) - because there's no previous row to substitute
// 2. Remove 'd', 'g', 'G' instructions entirely - they reference non-existent previous state
export function filterFirstLineInstructions(instructions) {
    return instructions
        .filter(ins => ins.type === 'i' || ins.type === 's')
        .map(ins => {
        if (ins.type === 's') {
            // Convert 's' to 'i'
            return {
                type: 'i',
                row: ins.row,
                sequenceName: ins.sequenceName,
                start: ins.start,
                strand: ins.strand,
                sequenceLength: ins.sequenceLength,
            };
        }
        return ins;
    });
}
export function parseRowInstructions(meta) {
    const ret = meta.split(' ');
    const rows = [];
    for (let i = 0; i < ret.length;) {
        const type = ret[i++];
        if (type === 'i') {
            const row = +ret[i++];
            const sequenceName = ret[i++];
            rows.push({
                type,
                row,
                sequenceName,
                start: +ret[i++],
                strand: ret[i++] === '-' ? -1 : 1,
                sequenceLength: +ret[i++],
            });
        }
        else if (type === 's') {
            const row = +ret[i++];
            const sequenceName = ret[i++];
            rows.push({
                type,
                row,
                sequenceName,
                start: +ret[i++],
                strand: ret[i++] === '-' ? -1 : 1,
                sequenceLength: +ret[i++],
            });
        }
        else if (type === 'd') {
            rows.push({
                type,
                row: +ret[i++],
            });
        }
        else if (type === 'g') {
            rows.push({
                type,
                row: +ret[i++],
                gapLength: +ret[i++],
            });
        }
        else if (type === 'G') {
            rows.push({
                type,
                row: +ret[i++],
                gapSubstring: ret[i++],
            });
        }
    }
    return rows;
}
//# sourceMappingURL=rowInstructions.js.map