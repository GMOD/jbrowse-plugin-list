export function extractSubsequence(sequence, relativeStart, relativeEnd) {
    if (sequence.split('').every(char => char === '-')) {
        return {
            extractedSequence: sequence,
            actualStart: 0,
        };
    }
    const nonGapToActualMap = [];
    let nonGapCount = 0;
    for (let i = 0; i < sequence.length; i++) {
        if (sequence[i] !== '-') {
            nonGapToActualMap[nonGapCount] = i;
            nonGapCount++;
        }
    }
    if (nonGapCount <= relativeStart) {
        return {
            extractedSequence: sequence,
            actualStart: 0,
        };
    }
    const startIndex = nonGapToActualMap[relativeStart] ?? 0;
    let endIndex = sequence.length;
    if (relativeEnd < nonGapCount &&
        nonGapToActualMap[relativeEnd] !== undefined) {
        endIndex = nonGapToActualMap[relativeEnd];
    }
    return {
        extractedSequence: sequence.slice(startIndex, endIndex),
        actualStart: startIndex,
    };
}
//# sourceMappingURL=extractSubsequence.js.map