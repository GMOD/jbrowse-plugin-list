export function parseLineByLine(buffer, cb) {
    let blockStart = 0;
    const entries = [];
    const decoder = new TextDecoder('ascii');
    while (blockStart < buffer.length) {
        const n = buffer.indexOf(10, blockStart);
        if (n === -1) {
            break;
        }
        const b = buffer.subarray(blockStart, n);
        const line = decoder.decode(b).trim();
        if (line) {
            const entry = cb(line);
            if (entry) {
                entries.push(entry);
            }
        }
        blockStart = n + 1;
    }
    return entries;
}
// Count non-gap characters in a string
export function countNonGapBases(seq) {
    let count = 0;
    for (const char of seq) {
        if (char !== '-' && char !== ' ') {
            count++;
        }
    }
    return count;
}
//# sourceMappingURL=util.js.map