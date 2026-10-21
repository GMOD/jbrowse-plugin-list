function lowerBound(sorted, value) {
    let lo = 0;
    let hi = sorted.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (sorted[mid] < value) {
            lo = mid + 1;
        }
        else {
            hi = mid;
        }
    }
    return lo;
}
/**
 * The score on each base of `bases`, from 0-based half-open intervals. Where
 * intervals overlap a base the highest score counts, so the result does not
 * depend on the order they arrive in.
 */
export function scoreByBase(intervals, bases) {
    const sorted = bases.toSorted((a, b) => a - b);
    const scores = new Map();
    for (const { start, end, score } of intervals) {
        if (!Number.isFinite(score)) {
            continue;
        }
        for (let i = lowerBound(sorted, start); i < sorted.length && sorted[i] < end; i++) {
            const base = sorted[i];
            const seen = scores.get(base);
            if (seen === undefined || score > seen) {
                scores.set(base, score);
            }
        }
    }
    return scores;
}
function reduce(scores, stat) {
    return stat === 'max'
        ? Math.max(...scores)
        : stat === 'min'
            ? Math.min(...scores)
            : scores.reduce((sum, s) => sum + s, 0) / scores.length;
}
/**
 * One value per transcript residue: `stat` over the scores on the bases of its
 * codon. A residue none of whose bases has a score has no value.
 */
export function scoreByResidue(p2gCodon, baseScores, stat) {
    const byPosition = new Map();
    for (const [pos, bases] of Object.entries(p2gCodon)) {
        const scores = bases.flatMap(base => baseScores.get(base) ?? []);
        if (scores.length > 0) {
            byPosition.set(Number(pos), reduce(scores, stat));
        }
    }
    return byPosition;
}
