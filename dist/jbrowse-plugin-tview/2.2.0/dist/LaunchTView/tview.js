import { alignInsertionSite } from './align';
import { absorbAdjacentInsertions, buildArrayBlocks } from './alleles';
import { ABSENT, SPANNED_GAP, byStart, clipInsertions, getReadNames, parseRead, } from './readLayout';
import { findReferenceArrays, mergeArrays } from './repeats';
import { newickSafe } from './sampleTree';
export { clipInsertions, parseCigar, parseRead } from './readLayout';
/**
 * Mutually aligns the sequences inserted at each reference position, so reads
 * sharing an insertion event line up inside it. Positions an array block has
 * taken over are left alone: those bases are part of an allele the block
 * already laid out, and giving them insertion columns as well would render
 * them twice.
 */
export function alignInsertionColumns(reads, ownedByArray) {
    const byPos = new Map();
    for (const read of reads) {
        for (const [pos, ins] of read.insertions) {
            if (ownedByArray.has(pos)) {
                continue;
            }
            const seqs = byPos.get(pos);
            if (seqs) {
                seqs.push(ins);
            }
            else {
                byPos.set(pos, [ins]);
            }
        }
    }
    const aligned = new Map([...byPos].map(([pos, seqs]) => [pos, alignInsertionSite(seqs)]));
    return reads.map(read => ({
        ...read,
        insertions: new Map([...read.insertions].map(([pos, ins]) => [
            pos,
            aligned.get(pos)?.gapped.get(ins) ?? ins,
        ])),
    }));
}
/** widest insertion any read has at each reference position (sparse) */
export function maxInsertionWidths(reads, ownedByArray) {
    const ret = new Map();
    for (const read of reads) {
        for (const [pos, ins] of read.insertions) {
            if (!ownedByArray.has(pos)) {
                ret.set(pos, Math.max(ret.get(pos) ?? 0, ins.length));
            }
        }
    }
    return ret;
}
function arrayStartIndex(arrays) {
    return new Map(arrays.map(a => [a.start, a]));
}
/**
 * Each reference position contributes its insertion columns (widest across all
 * reads) followed by one reference column, so every row comes out the same
 * length and stays aligned — except where an array block takes over, and
 * contributes one run of columns for the whole interval it covers.
 */
export function buildColumnLayout(start, end, insWidths, arrays = []) {
    const byStartPos = arrayStartIndex(arrays);
    const offsets = [];
    let col = 0;
    let pos = start;
    while (pos < end) {
        const array = byStartPos.get(pos);
        if (array) {
            const stop = Math.min(array.end, end);
            offsets.push(col);
            col += array.width;
            for (let p = pos + 1; p < stop; p++) {
                offsets.push(col);
            }
            pos = stop;
        }
        else {
            offsets.push(col);
            col += (insWidths.get(pos) ?? 0) + 1;
            pos++;
        }
    }
    offsets.push(col);
    return { start, end, insWidths, arrays, offsets, totalColumns: col };
}
/** the array covering `pos`, when `pos` is strictly inside one */
function arrayContaining(arrays, pos) {
    return arrays.find(a => a.start < pos && pos < a.end);
}
/**
 * Lays a single row out across the whole region. Rows are typically a tiny
 * fraction of the region, so the columns on either side are filled in one shot
 * from the offsets rather than walked position by position — which works over
 * array blocks too, since the offsets already carry their width.
 */
export function renderRow(read, layout) {
    const { start, end, insWidths, arrays, offsets, totalColumns } = layout;
    const byStartPos = arrayStartIndex(arrays);
    // a trailing insertion is keyed one past the last position the read spans
    let from = Math.max(start, read.start);
    let to = Math.min(end, read.start + read.refChars.length + 1);
    // a row that begins or ends inside an array does not span it, so it gets no
    // block; snapping past the block keeps the walk from emitting part of one
    const startsInside = arrayContaining(arrays, from);
    if (startsInside) {
        from = Math.min(end, startsInside.end);
    }
    const endsInside = arrayContaining(arrays, to);
    if (endsInside) {
        to = endsInside.start;
    }
    if (to <= from) {
        return ABSENT.repeat(totalColumns);
    }
    let ret = ABSENT.repeat(offsets[from - start]);
    let pos = from;
    while (pos < to) {
        const array = byStartPos.get(pos);
        if (array) {
            const row = array.rowByName.get(read.name);
            ret += row ?? SPANNED_GAP.repeat(array.width);
            pos = Math.min(array.end, to);
            continue;
        }
        const idx = pos - read.start;
        const spanned = idx >= 0 && idx < read.refChars.length;
        const refChar = spanned ? read.refChars[idx] : ABSENT;
        const width = insWidths.get(pos) ?? 0;
        if (width) {
            // a read that is not really here pads the insertion the same way it
            // pads the reference column, so an intron reads as one absence
            const pad = refChar === ABSENT ? ABSENT : SPANNED_GAP;
            const ins = read.insertions.get(pos) ?? '';
            ret += ins + pad.repeat(width - ins.length);
        }
        ret += refChar;
        pos++;
    }
    return ret + ABSENT.repeat(totalColumns - offsets[to - start]);
}
// A defline is truncated at its first space (msa-parsers' FastaMSA), so the
// count is joined on. `labelsAlignRight` puts it flush against the sequence.
const COPY_COUNT_SEPARATOR = '|';
/**
 * What a row is called on screen. The one place `label` falls back to `name`,
 * so the defline and the tree leaf cannot disagree about it — react-msaview
 * joins them by string, and a row the tree names differently renders blank.
 */
export function rowLabel(read) {
    return read.label ?? read.name;
}
/**
 * Rows ordered longest-allele-first and labelled with their copy count.
 *
 * Copy number is the measurement at a tandem array, and reading it off where a
 * row runs out is the thing the unit-per-block layout exists to avoid, so it is
 * stated in the label. Ordering by it puts the alleles in a ladder, which is
 * what makes one row's array comparable to the next at a glance. Rows that do
 * not span the array keep genomic order, below the ones that do; the reference
 * stays on top whatever its allele, since it is what the columns are named
 * after rather than one of the observations.
 */
export function labelAndOrderByCopies(reads, array, referenceName) {
    const rank = (read) => (read.name === referenceName ? 1 : 0);
    return reads
        .map(read => ({ read, copies: array.copiesByName.get(read.name) }))
        .sort((a, b) => {
        const byRef = rank(b.read) - rank(a.read);
        if (byRef) {
            return byRef;
        }
        if (a.copies === undefined || b.copies === undefined) {
            return a.copies === b.copies
                ? byStart(a.read, b.read)
                : a.copies === undefined
                    ? 1
                    : -1;
        }
        return b.copies - a.copies || byStart(a.read, b.read);
    })
        .map(({ read, copies }) => copies === undefined
        ? read
        : { ...read, label: `${read.name}${COPY_COUNT_SEPARATOR}n=${copies}` });
}
/** Widest spread of allele lengths, i.e. the array the reads disagree most about. */
function alleleSpread(array) {
    const lengths = [...array.lengthByName.values()];
    return lengths.length ? Math.max(...lengths) - Math.min(...lengths) : 0;
}
/**
 * Works out the shape of the alignment without materializing it. Everything
 * here is proportional to the sequence data, unlike the render, which is
 * proportional to rows x columns and can be far larger.
 */
export function planTviewMsa({ features, refName, start, end, sequence, sampleOf, }) {
    const names = getReadNames(features, sampleOf);
    const parsed = features
        .map((f, i) => parseRead(f, names[i], sampleOf?.(i)))
        .sort(byStart);
    // The reference is laid out as a row like any other, which is what lets it be
    // one of the alleles an array block squares up rather than a thing the block
    // has to be compared against afterwards.
    const referenceName = sequence ? newickSafe(refName) : undefined;
    const referenceRead = sequence
        ? {
            name: referenceName,
            start,
            refChars: sequence.toUpperCase(),
            insertions: new Map(),
        }
        : undefined;
    const clipped = clipInsertions(referenceRead ? [referenceRead, ...parsed] : parsed, start, end);
    // the interval comes from the reference, then widens over the repeat alleles
    // the aligner anchored just outside it — see absorbAdjacentInsertions, which
    // has to see the reads and so cannot live in the reference scan
    const arrays = sequence
        ? buildArrayBlocks(clipped, absorbAdjacentInsertions(clipped, mergeArrays(findReferenceArrays(sequence, start))))
        : [];
    const ownedByArray = new Set();
    for (const array of arrays) {
        for (let pos = array.start; pos <= array.end; pos++) {
            ownedByArray.add(pos);
        }
    }
    const aligned = alignInsertionColumns(clipped, ownedByArray);
    // With several arrays in view the subject is the one the rows disagree most
    // about, since ordering rows by two copy numbers at once is not a thing rows
    // can do and an array every row agrees on orders nothing.
    const subject = arrays.reduce((best, array) => best && alleleSpread(best) >= alleleSpread(array) ? best : array, undefined);
    const reads = subject
        ? labelAndOrderByCopies(aligned, subject, referenceName)
        : aligned;
    const insWidths = maxInsertionWidths(reads, ownedByArray);
    const layout = buildColumnLayout(start, end, insWidths, arrays);
    return {
        reads,
        layout,
        insertionWidths: [...insWidths.entries()].sort((a, b) => a[0] - b[0]),
        arraySpans: arrays.map(a => [a.start, a.end, a.width]),
        region: { refName, start, end },
        cellCount: reads.length * layout.totalColumns,
        arrays,
        subject,
        referenceName,
        samples: [
            ...new Set(parsed.map(r => r.sample).filter(s => s !== undefined)),
        ],
    };
}
export function renderTviewMsa({ reads, layout }) {
    return reads.map(r => `>${rowLabel(r)}\n${renderRow(r, layout)}\n`).join('');
}
export function buildTviewMsa(args) {
    const plan = planTviewMsa(args);
    return {
        msa: renderTviewMsa(plan),
        insertionWidths: plan.insertionWidths,
        arraySpans: plan.arraySpans,
        region: plan.region,
        arrays: plan.arrays,
        subject: plan.subject,
    };
}
//# sourceMappingURL=tview.js.map