/**
 * Reads carrying the same insertion event usually differ slightly inside it
 * (sequencing error, or a real indel within the inserted allele). Laying each
 * one out left-justified puts those differences in different columns and the
 * shared event stops being readable. Aligning the inserted sequences against
 * each other fixes that.
 *
 * This is deliberately local to one reference position: the insertion still
 * occupies "as many columns as the widest gapped sequence", which is the only
 * thing buildColumnToRefPos knows about, so the column <-> reference mapping is
 * untouched.
 */
const MATCH = 2;
const MISMATCH = -2;
const GAP = -3;
// each sequence costs an O(n*m) pairwise alignment against the center, so fall
// back to left-justified layout rather than stall on a pathological site
const MAX_LEN = 200;
const MAX_DISTINCT = 30;
function subst(a, b) {
    return a === b ? MATCH : MISMATCH;
}
/** global alignment, returns both sequences with '-' inserted */
function needlemanWunsch(a, b) {
    const n = a.length;
    const m = b.length;
    const stride = m + 1;
    const score = new Int32Array((n + 1) * stride);
    for (let i = 1; i <= n; i++) {
        score[i * stride] = i * GAP;
    }
    for (let j = 1; j <= m; j++) {
        score[j] = j * GAP;
    }
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            score[i * stride + j] = Math.max(score[(i - 1) * stride + j - 1] + subst(a[i - 1], b[j - 1]), score[(i - 1) * stride + j] + GAP, score[i * stride + j - 1] + GAP);
        }
    }
    const outA = [];
    const outB = [];
    let i = n;
    let j = m;
    while (i > 0 || j > 0) {
        const cur = score[i * stride + j];
        const diagonal = i > 0 &&
            j > 0 &&
            cur === score[(i - 1) * stride + j - 1] + subst(a[i - 1], b[j - 1]);
        if (diagonal) {
            outA.push(a[i - 1]);
            outB.push(b[j - 1]);
            i--;
            j--;
        }
        else if (i > 0 && cur === score[(i - 1) * stride + j] + GAP) {
            outA.push(a[i - 1]);
            outB.push('-');
            i--;
        }
        else {
            outA.push('-');
            outB.push(b[j - 1]);
            j--;
        }
    }
    return {
        center: outA.reverse().join(''),
        other: outB.reverse().join(''),
    };
}
function splitAgainstCenter({ center, other }, centerLen) {
    const slots = Array.from({ length: centerLen + 1 }, () => '');
    let atCenter = '';
    for (let k = 0; k < center.length; k++) {
        if (center[k] === '-') {
            slots[atCenter.length] = slots[atCenter.length] + other[k];
        }
        else {
            atCenter += other[k];
        }
    }
    return { slots, atCenter };
}
function emit({ slots, atCenter }, slotWidths) {
    let ret = '';
    for (let j = 0; j < atCenter.length; j++) {
        const slot = slots[j];
        ret += slot + '-'.repeat(slotWidths[j] - slot.length) + atCenter[j];
    }
    const last = slots[atCenter.length];
    return ret + last + '-'.repeat(slotWidths[atCenter.length] - last.length);
}
/**
 * Center-star multiple alignment of the sequences inserted at one reference
 * position. Returns each distinct input mapped to a gapped version, all of the
 * same length. Returns an empty map when there is nothing to gain (a single
 * distinct sequence) or when the site is too large to be worth aligning; the
 * caller then keeps the sequences as-is and left-justifies them.
 */
export function alignInsertions(seqs) {
    const distinct = [...new Set(seqs)];
    const longest = distinct.reduce((a, b) => (b.length > a.length ? b : a), '');
    if (distinct.length < 2 ||
        distinct.length > MAX_DISTINCT ||
        longest.length > MAX_LEN) {
        return new Map();
    }
    const centerLen = longest.length;
    const others = distinct.filter(s => s !== longest);
    const splits = others.map(s => splitAgainstCenter(needlemanWunsch(longest, s), centerLen));
    const centerSplit = {
        slots: Array.from({ length: centerLen + 1 }, () => ''),
        atCenter: longest,
    };
    const slotWidths = Array.from({ length: centerLen + 1 }, (_, j) => splits.reduce((max, s) => Math.max(max, s.slots[j].length), 0));
    return new Map([
        [longest, emit(centerSplit, slotWidths)],
        ...others.map((seq, i) => [seq, emit(splits[i], slotWidths)]),
    ]);
}
//# sourceMappingURL=align.js.map