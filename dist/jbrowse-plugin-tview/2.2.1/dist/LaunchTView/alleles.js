import { alignToUnit, unitIdentity } from './align';
const SPANNED_GAP = '-';
const ABSENT = '.';
/**
 * What one row has between two reference positions: its matched bases, plus
 * whatever it inserted inside, minus whatever it deleted.
 *
 * This is the measurement the insertion-anchored reading cannot make. An indel
 * inside an array has no unique placement, so two reads carrying the same allele
 * can disagree about which reference position it is inserted at and by how much;
 * summed over the interval, those choices cancel and both come back the same
 * length. Undefined when the row does not reach both edges — copies cannot be
 * counted from a read that stops inside the array, and guessing from a partial
 * one is how a truncated read reads as a contracted allele.
 */
export function extractAllele(read, start, end) {
    const last = read.start + read.refChars.length;
    if (read.start > start || last < end) {
        return undefined;
    }
    let ret = '';
    for (let pos = start; pos <= end; pos++) {
        ret += read.insertions.get(pos) ?? '';
        if (pos < end) {
            const char = read.refChars[pos - read.start];
            if (char === ABSENT) {
                // an N op skips the position rather than deleting it, so the row has no
                // allele here at all rather than a shorter one
                return undefined;
            }
            if (char !== SPANNED_GAP) {
                ret += char;
            }
        }
    }
    return ret;
}
/**
 * How far outside an array an insertion is looked for, in reference bases.
 *
 * GIAB's adotto tandem repeat catalog buffers every interval by +/-25bp before
 * merging, to leave room for the alignment ambiguity that comes with capturing
 * variation inside a repeat, and measured what the buffer misses: re-expanding
 * every region by a further 10bp would move only 0.2% of its boundaries
 * (English et al., Nat Biotechnol 42, 2024, doi:10.1038/s41587-024-02225-z). A
 * whole copy is the floor for a unit longer than that, since a copy is the
 * aligner's room to slide a repeat indel. Both cover the misplacements measured
 * in this trio: ATXN3 at 1bp, FMR1 at 2bp of a 3bp unit, ABCA7 at 19bp of a
 * 25bp one.
 *
 * It bounds the search, not the answer. Whether an insertion actually moves is
 * decided exactly, by `shiftInsertion`, so this being generous costs nothing.
 */
const FLANK_BP = 25;
/** the read's aligned base at a reference position, if it has one there */
function readBase(read, pos) {
    const i = pos - read.start;
    return i >= 0 && i < read.refChars.length ? read.refChars[i] : undefined;
}
/**
 * How much of an insertion the array's unit has to explain before it counts as
 * the array's. The repeat alleles the aligner anchored just outside an array in
 * the trio score 0.9 and up, and unrelated sequence scores 0.67 or below, so
 * this sits in open space rather than on a boundary.
 */
const BELONGS_IDENTITY = 0.8;
/**
 * `ins`, inserted before reference position `from`, rewritten as an insertion
 * before `to` — or undefined when the read's own bases do not allow it.
 *
 * An insertion has no unique position. `S` before a base `b` and `rotate(S)`
 * after it spell the same read, so an aligner is free to anchor an expansion
 * outside the array it belongs to, and at ATXN3 it did exactly that for most of
 * the reads carrying one. Walking an indel through that equivalence class is
 * the standard normalization for it (Tan, Abecasis & Kang, "Unified
 * representation of genetic variants", Bioinformatics 31, 2015,
 * doi:10.1093/bioinformatics/btv112, which walks left; this walks toward the
 * array, the same operation with the array as the canonical anchor).
 *
 * The step is tested against the **read's** aligned base rather than the
 * reference's, which is what makes the rewrite exact: the row still renders
 * base for base as it did, and the only thing that changes is the reference
 * position the bases are filed under. A step onto a deletion has no base to
 * swap with and stops.
 *
 * Being exact, it is also incomplete, and measurably so. An aligner does not
 * only choose among equivalent placements — it chooses the highest-scoring one,
 * which for a repeat allele carrying an interruption is often not equivalent to
 * any placement inside the array. FMR1's misplaced read is exactly that: 32bp
 * of the locus's own CGG anchored two bases early, starting on a `C` where the
 * read has a `G`, so no rewrite of it exists. Hence `reanchorInsertions` treats
 * this as the preferred spelling and not as the test of whether to move.
 */
export function shiftInsertion(read, from, to, ins) {
    let seq = ins;
    for (let pos = from; pos < to; pos++) {
        const head = seq[0];
        if (readBase(read, pos) !== head) {
            return undefined;
        }
        seq = seq.slice(1) + head;
    }
    for (let pos = from - 1; pos >= to; pos--) {
        const tail = seq.at(-1);
        if (readBase(read, pos) !== tail) {
            return undefined;
        }
        seq = tail + seq.slice(0, -1);
    }
    return seq;
}
/**
 * The window around each array that its insertions may be re-anchored from.
 *
 * Two arrays may not claim one position: `extractAllele` reads the slot at an
 * array's `end`, so a shared slot would be counted into two alleles. Neighbours
 * split the reference between them down the middle — a property of the
 * reference alone, so unlike the interval it replaces, no read can move it.
 */
export function flankWindows(arrays) {
    const ordered = [...arrays].sort((a, b) => a.start - b.start);
    return ordered.map((array, i) => {
        const pad = Math.max(FLANK_BP, array.period);
        const previous = ordered[i - 1];
        const next = ordered[i + 1];
        return {
            array,
            from: Math.max(array.start - pad, previous ? Math.floor((previous.end + array.start) / 2) + 1 : -Infinity),
            to: Math.min(array.end + pad, next ? Math.floor((array.end + next.start) / 2) : Infinity),
        };
    });
}
/** the array whose window `pos` falls in, if any */
function windowAt(pos, windows) {
    for (const window of windows) {
        if (pos < window.from) {
            return undefined;
        }
        if (pos <= window.to) {
            return window;
        }
    }
    return undefined;
}
/**
 * Re-file each read's insertions under the array they belong to, one read at a
 * time.
 *
 * Measuring an allele over a reference interval fixes the "one array reports as
 * several sites" problem for indels the aligner placed *inside* the interval.
 * It does not fix the ones placed just outside: there the insertion is part of
 * no allele — it becomes its own run of insertion columns — and the read
 * carrying it is measured as though it had the reference allele. Both halves of
 * that are wrong, and neither is rare: at ATXN3 the aligner anchored 60 of 162
 * reads' expansions one base outside the array.
 *
 * Doing this per read is the whole point. Widening the shared interval instead
 * — which is what this replaces — made one read's misplacement everyone's: a
 * single spurious copy anchored two bases early moved the array's left edge for
 * every row, and the reference's own copy count with it. Re-anchoring touches
 * only the read that carries the insertion, so a read can be wrong on its own.
 *
 * Nothing here consults the other reads, or how many of them agree. A single
 * read's expansion is as real as fifty, which is what measuring over an
 * interval buys and what a vote would give back. What decides an insertion is
 * its own sequence: `unitIdentity` against the array's unit, since the aligner
 * is free to place a repeat allele outside the array but is not free to make
 * unrelated sequence out of the array's unit.
 */
export function reanchorInsertions(reads, arrays) {
    const windows = flankWindows(arrays);
    if (!windows.length) {
        return reads;
    }
    // memoized per array and distinct insert: one locus routinely has dozens of
    // reads carrying the same allele at the same site
    const belongs = new Map();
    const isUnit = (window, ins) => {
        const key = `${window.array.start}:${ins}`;
        let ret = belongs.get(key);
        if (ret === undefined) {
            ret =
                // a whole copy at least: a base or two of read error beside an array
                // says nothing about where its allele ends, and the identity of a
                // fragment shorter than the unit is not a measurement of anything
                ins.length >= window.array.period &&
                    unitIdentity(ins, window.array.unit) >= BELONGS_IDENTITY;
            belongs.set(key, ret);
        }
        return ret;
    };
    return reads.map(read => {
        if (!read.insertions.size) {
            return read;
        }
        let moved = false;
        const next = new Map();
        // Insertions are re-filed in genomic order of where the aligner put them,
        // so two events landing in one slot keep their order along the read.
        for (const [pos, ins] of [...read.insertions].sort((a, b) => a[0] - b[0])) {
            const window = windowAt(pos, windows);
            const { start, end } = window?.array ?? {};
            const target = window === undefined || (pos >= start && pos <= end)
                ? undefined
                : isUnit(window, ins)
                    ? pos < start
                        ? start
                        : end
                    : undefined;
            // an exact rewrite is preferred where one exists, so a row that can be
            // re-spelled reads base for base as the aligner wrote it; where none
            // exists the bases move as written, which preserves the length the
            // measurement is made of
            const at = target ?? pos;
            moved ||= target !== undefined;
            const seq = target === undefined ? ins : (shiftInsertion(read, pos, target, ins) ?? ins);
            next.set(at, (next.get(at) ?? '') + seq);
        }
        return moved ? { ...read, insertions: next } : read;
    });
}
/**
 * Lay every row's allele out unit-per-block, one block per array.
 *
 * Arrays whose alleles are all one length still get a block: squaring the copies
 * up against each other is what turns "this row is 63 bases long" into "this row
 * has 21 copies and the 12th one differs", and that is true whether or not the
 * rows disagree.
 */
export function buildArrayBlocks(reads, arrays) {
    const ret = [];
    for (const array of arrays) {
        const alleleByName = new Map();
        for (const read of reads) {
            const allele = extractAllele(read, array.start, array.end);
            if (allele !== undefined) {
                alleleByName.set(read.name, allele);
            }
        }
        const aligned = alignToUnit([...alleleByName.values()], array.unit);
        if (!aligned) {
            continue;
        }
        const rowByName = new Map();
        const copiesByName = new Map();
        const lengthByName = new Map();
        for (const [name, allele] of alleleByName) {
            const row = aligned.gapped.get(allele);
            const copies = aligned.copies.get(allele);
            if (row !== undefined && copies !== undefined) {
                rowByName.set(name, row);
                copiesByName.set(name, copies);
                lengthByName.set(name, allele.length);
            }
        }
        ret.push({
            start: array.start,
            end: array.end,
            period: aligned.period,
            unit: array.unit,
            width: aligned.unitWidths.reduce((a, b) => a + b, 0),
            unitWidths: aligned.unitWidths,
            rowByName,
            copiesByName,
            lengthByName,
        });
    }
    return ret;
}
//# sourceMappingURL=alleles.js.map