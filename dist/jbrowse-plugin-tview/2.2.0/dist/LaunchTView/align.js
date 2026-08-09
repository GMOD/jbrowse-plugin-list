/**
 * Reads carrying the same insertion event usually differ slightly inside it
 * (sequencing error, or a real indel within the inserted allele). Laying each
 * one out left-justified puts those differences in different columns and the
 * shared event stops being readable. Aligning the inserted sequences against
 * each other fixes that.
 *
 * There are two ways to do it, and which one applies is a property of the
 * inserted sequence rather than a setting:
 *
 * - **Aperiodic** (`alignInsertions`): one center-star alignment over the whole
 *   inserted sequence. Right for a novel insertion, a mobile element, anything
 *   whose bases only make sense read straight through.
 * - **Periodic** (`alignPeriodicInsertions`): a tandem array, where the whole
 *   inserted sequence is n copies of one unit. Aligning those base-to-base is
 *   both unaffordable and wrong — it is free to align copy 5 of one read to
 *   copy 3 of another, and the difference that matters (how many copies) ends
 *   up expressed as where the row stops. Aligning unit-to-unit instead puts
 *   copy k of every read in the same columns, so copy number reads as a count
 *   of blocks and a divergent copy stands out as a column inside its block.
 *
 * Both are local to one reference position: the insertion still occupies "as
 * many columns as the widest gapped sequence", which is the only thing
 * buildColumnToRefPos knows about, so the column <-> reference mapping is
 * untouched either way.
 */
const MATCH = 2;
const MISMATCH = -2;
const GAP = -3;
// each sequence costs an O(n*m) pairwise alignment against the center, so fall
// back to left-justified layout rather than stall on a pathological site
const MAX_LEN = 200;
const MAX_DISTINCT = 30;
// Shortest unit that earns a unit-per-block layout. The scan below starts at 1
// so it reports the TRUE minimal period, which is what makes a homopolymer come
// back as 1 and get declined here: `AAAA...` is periodic at every lag, and
// laying it out as 2bp blocks would be an arbitrary reading of one run of A.
const MIN_UNIT_PERIOD = 2;
// Longest unit the scan looks for. Covers STRs and the common VNTR range; the
// megabase-unit arrays (LPA KIV-2 at 5.5kb) need more copies than a read holds
// before they are periodic at all, so they are out of reach here regardless.
const MAX_PERIOD = 300;
// Copies needed before a sequence counts as an array. Two copies of anything is
// a duplication, not a tandem repeat, and at two the period is unidentifiable
// from the sequence alone.
const MIN_COPIES = 3;
// Fraction of positions that must agree at lag p for p to be the period. Loose
// enough for the ~5-15% divergence between copies of a real VNTR unit and for
// long-read error on top of it.
const PERIODIC_MATCH = 0.8;
// The period scan is O(len * maxPeriod), so it runs on a prefix rather than the
// whole insert. An array that is periodic in its first 3kb is periodic.
const PROBE_LEN = 3000;
// Backstops on the unit-level work, in the same spirit as MAX_LEN/MAX_DISTINCT:
// decline and leave the site to the aperiodic path rather than stall on it.
const MAX_UNITS = 1000;
const MAX_PERIODIC_CELLS = 20_000_000;
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
 * The smallest lag at which a sequence repeats, or undefined when it does not.
 *
 * Scanning up from 1 returns the true minimal period, which is what separates a
 * tandem array from a homopolymer: `AAAA...` matches at every lag and comes back
 * as 1, and a 30bp unit comes back as 30 rather than as 60 or 90.
 */
export function detectPeriod(seq) {
    const probe = seq.length > PROBE_LEN ? seq.slice(0, PROBE_LEN) : seq;
    const maxPeriod = Math.min(MAX_PERIOD, Math.floor(probe.length / MIN_COPIES));
    for (let p = 1; p <= maxPeriod; p++) {
        const n = probe.length - p;
        let matches = 0;
        for (let i = 0; i < n; i++) {
            if (probe[i] === probe[i + p]) {
                matches++;
            }
        }
        if (matches / n >= PERIODIC_MATCH) {
            return p;
        }
    }
    return undefined;
}
/**
 * Majority base at each offset within the unit, over the whole-length copies of
 * `seq`. The consensus is what every copy of every read is aligned to, so it has
 * to be one fixed string for the site — deriving it per read would let two reads
 * disagree about where a unit starts.
 */
export function consensusUnit(seq, period) {
    const copies = Math.floor(seq.length / period);
    let ret = '';
    for (let j = 0; j < period; j++) {
        const counts = new Map();
        for (let k = 0; k < copies; k++) {
            const c = seq[k * period + j];
            counts.set(c, (counts.get(c) ?? 0) + 1);
        }
        // ties break lexicographically so the consensus is a function of the input
        // and not of Map iteration order
        ret += [...counts].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0][0];
    }
    return ret;
}
/**
 * Align one copy of the consensus unit against `seq` starting at `from`: global
 * on the consensus, since a copy is a whole copy, and free at the window's right
 * edge, since the copy ends wherever it ends. `consumed` is where the next copy
 * starts, which is what lets an indel inside one copy stay inside it rather than
 * shifting every copy after it.
 */
function alignUnitAt(consensus, seq, from) {
    const n = consensus.length;
    const m = Math.min(2 * n, seq.length - from);
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
            score[i * stride + j] = Math.max(score[(i - 1) * stride + j - 1] +
                subst(consensus[i - 1], seq[from + j - 1]), score[(i - 1) * stride + j] + GAP, score[i * stride + j - 1] + GAP);
        }
    }
    // the copy ends at whichever window position scores best once the consensus
    // is spent
    let consumed = 0;
    let best = score[n * stride];
    for (let j = 1; j <= m; j++) {
        const s = score[n * stride + j];
        if (s > best) {
            best = s;
            consumed = j;
        }
    }
    // a copy that consumed nothing would not advance the cursor
    if (consumed === 0) {
        return undefined;
    }
    const outCenter = [];
    const outOther = [];
    let i = n;
    let j = consumed;
    while (i > 0 || j > 0) {
        const cur = score[i * stride + j];
        const diagonal = i > 0 &&
            j > 0 &&
            cur ===
                score[(i - 1) * stride + j - 1] +
                    subst(consensus[i - 1], seq[from + j - 1]);
        if (diagonal) {
            outCenter.push(consensus[i - 1]);
            outOther.push(seq[from + j - 1]);
            i--;
            j--;
        }
        else if (i > 0 && cur === score[(i - 1) * stride + j] + GAP) {
            outCenter.push(consensus[i - 1]);
            outOther.push('-');
            i--;
        }
        else {
            outCenter.push('-');
            outOther.push(seq[from + j - 1]);
            j--;
        }
    }
    return {
        center: outCenter.reverse().join(''),
        other: outOther.reverse().join(''),
        consumed,
    };
}
/** Every copy in `seq`, each as a pairwise alignment against the consensus. */
function splitIntoUnits(seq, consensus) {
    const units = [];
    let cursor = 0;
    while (cursor < seq.length) {
        const unit = alignUnitAt(consensus, seq, cursor);
        if (!unit || units.length >= MAX_UNITS) {
            return undefined;
        }
        units.push(unit);
        cursor += unit.consumed;
    }
    return units;
}
// The tiled alignment below is O(len * len), so it scores a prefix rather than
// the whole insert. A sequence that is copies of the unit for its first 300
// bases is copies of the unit.
const IDENTITY_PROBE_LEN = 300;
/**
 * How much of `seq` is explained by `unit` repeated end to end: the fraction of
 * `seq`'s bases that align to a matching base of the tiling.
 *
 * Free at both ends of the tiling, since an inserted run of copies can start
 * and stop mid-copy, and global on `seq`, since the question is about all of it.
 * That is what separates "more copies of this array" from "something else that
 * landed next to it" without asking the sequence to be in phase with the unit:
 * measured against the trio, the repeat alleles the aligner anchored just
 * outside an array score 0.94-1.00 and unrelated sequence of the same length
 * scores 0.67 or below.
 */
export function unitIdentity(seq, unit) {
    const probe = seq.length > IDENTITY_PROBE_LEN ? seq.slice(0, IDENTITY_PROBE_LEN) : seq;
    const n = probe.length;
    if (!n || !unit.length) {
        return 0;
    }
    // two spare copies so the alignment can start mid-copy and still run off the
    // end without paying for it
    const tile = unit.repeat(Math.ceil(n / unit.length) + 2);
    const m = tile.length;
    const stride = m + 1;
    const score = new Int32Array((n + 1) * stride);
    const matches = new Int32Array((n + 1) * stride);
    // row 0 stays zero: starting anywhere in the tiling is free
    for (let i = 1; i <= n; i++) {
        score[i * stride] = i * GAP;
    }
    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= m; j++) {
            const hit = probe[i - 1] === tile[j - 1];
            const diagonal = score[(i - 1) * stride + j - 1] + (hit ? MATCH : MISMATCH);
            const up = score[(i - 1) * stride + j] + GAP;
            const left = score[i * stride + j - 1] + GAP;
            const best = Math.max(diagonal, up, left);
            score[i * stride + j] = best;
            matches[i * stride + j] =
                best === diagonal
                    ? matches[(i - 1) * stride + j - 1] + (hit ? 1 : 0)
                    : best === up
                        ? matches[(i - 1) * stride + j]
                        : matches[i * stride + j - 1];
        }
    }
    let best = score[n * stride];
    let bestMatches = matches[n * stride];
    for (let j = 1; j <= m; j++) {
        if (score[n * stride + j] > best) {
            best = score[n * stride + j];
            bestMatches = matches[n * stride + j];
        }
    }
    return bestMatches / n;
}
/**
 * Unit-per-block alignment of the sequences inserted at one reference position.
 *
 * Copy k of every sequence lands in the same block of columns, and a block is
 * as wide as the widest version of that copy across the site, so a sequence with
 * fewer copies runs out of blocks rather than drifting out of register. Returns
 * undefined when the site is not a tandem array, or is too big to lay out this
 * way; the caller falls back to `alignInsertions`.
 *
 * **Blocks are array order, not homology.** Copies are anchored at the left edge
 * of the insertion and counted rightward, so block k is "the kth copy along",
 * and arrays grow and shrink by unequal crossing over anywhere inside them —
 * block 9 of a 12-copy allele and block 9 of a 20-copy allele need not be the
 * same copy. What the layout does buy is that copies stay in register, so a
 * single divergent copy shows up as a column instead of shifting every copy
 * after it. Reading down one row is sound; reading across two is a hypothesis.
 */
export function alignPeriodicInsertions(seqs) {
    const distinct = [...new Set(seqs)];
    const longest = distinct.reduce((a, b) => (b.length > a.length ? b : a), '');
    const period = detectPeriod(longest);
    if (period === undefined || period < MIN_UNIT_PERIOD) {
        return undefined;
    }
    return alignToUnit(distinct, consensusUnit(longest, period));
}
/**
 * Unit-per-block alignment against a unit the caller already knows.
 *
 * Separated from `alignPeriodicInsertions` because where the unit comes from is
 * the whole difference between the two ways of finding an array. Measured off
 * the inserted sequences, it can only be derived from one of them — the longest,
 * which is a guess that one chimeric read overturns for the whole site. Measured
 * off the reference, it is a property of the locus, so every read is laid out
 * against the same unit whatever the reads happen to be.
 */
export function alignToUnit(seqs, consensus) {
    const distinct = [...new Set(seqs)].filter(s => s.length > 0);
    const period = consensus.length;
    if (!distinct.length || period < MIN_UNIT_PERIOD) {
        return undefined;
    }
    const totalUnits = distinct.reduce((a, s) => a + Math.ceil(s.length / period), 0);
    if (totalUnits * (period + 1) * (2 * period + 1) > MAX_PERIODIC_CELLS) {
        return undefined;
    }
    const splits = new Map();
    for (const seq of distinct) {
        const units = splitIntoUnits(seq, consensus);
        if (!units) {
            return undefined;
        }
        splits.set(seq, units.map(u => splitAgainstCenter(u, period)));
    }
    const maxUnits = Math.max(...[...splits.values()].map(u => u.length));
    const slotWidths = [];
    for (let k = 0; k < maxUnits; k++) {
        const widths = Array.from({ length: period + 1 }, () => 0);
        for (const unitSplits of splits.values()) {
            const split = unitSplits[k];
            if (split) {
                for (let j = 0; j <= period; j++) {
                    widths[j] = Math.max(widths[j], split.slots[j].length);
                }
            }
        }
        slotWidths.push(widths);
    }
    const unitWidths = slotWidths.map(w => period + w.reduce((a, b) => a + b, 0));
    const gapped = new Map();
    const copies = new Map();
    for (const [seq, unitSplits] of splits) {
        let row = '';
        for (let k = 0; k < maxUnits; k++) {
            const split = unitSplits[k];
            row += split ? emit(split, slotWidths[k]) : '-'.repeat(unitWidths[k]);
        }
        gapped.set(seq, row);
        copies.set(seq, unitSplits.length);
    }
    return { period, gapped, copies, unitWidths };
}
/**
 * Lay out the sequences inserted at one reference position, by whichever of the
 * two alignments the sequence itself calls for. The single place that decision
 * is made, so a caller reading the period cannot disagree with the layout it
 * gets.
 *
 * A tandem array goes unit-per-block, which is both the readable answer and the
 * affordable one — the size caps here are what the base-to-base alignment costs,
 * and an expansion is always past them. Everything else gets the center-star
 * alignment, or is left alone (`gapped` empty) when there is nothing to gain
 * from a single distinct sequence, or the site is too large to be worth it.
 */
export function alignInsertionSite(seqs) {
    const distinct = [...new Set(seqs)];
    // an array is worth unrolling even when every read agrees on it: the copies
    // still have to be squared up with each other before they can be counted
    const periodic = alignPeriodicInsertions(distinct);
    if (periodic) {
        return { gapped: periodic.gapped, periodic };
    }
    const longest = distinct.reduce((a, b) => (b.length > a.length ? b : a), '');
    if (distinct.length < 2 ||
        distinct.length > MAX_DISTINCT ||
        longest.length > MAX_LEN) {
        return { gapped: new Map() };
    }
    const centerLen = longest.length;
    const others = distinct.filter(s => s !== longest);
    const splits = others.map(s => splitAgainstCenter(needlemanWunsch(longest, s), centerLen));
    const centerSplit = {
        slots: Array.from({ length: centerLen + 1 }, () => ''),
        atCenter: longest,
    };
    const slotWidths = Array.from({ length: centerLen + 1 }, (_, j) => splits.reduce((max, s) => Math.max(max, s.slots[j].length), 0));
    return {
        gapped: new Map([
            [longest, emit(centerSplit, slotWidths)],
            ...others.map((seq, i) => [
                seq,
                emit(splits[i], slotWidths),
            ]),
        ]),
    };
}
/**
 * The gapped sequences alone, for callers with no use for the period. Every
 * decision lives in `alignInsertionSite`.
 */
export function alignInsertions(seqs) {
    return alignInsertionSite(seqs).gapped;
}
//# sourceMappingURL=align.js.map