import { alignInsertionSite } from './align';
import { buildArrayBlocks, mergeInsertionSites, normalizeInsertions, reanchorInsertions, } from './alleles';
import { ABSENT, SPANNED_GAP, byStart, clipInsertions, getReadNames, parseRead, } from './readLayout';
import { findReferenceArrays, mergeArrays } from './repeats';
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
/**
 * Each reference position contributes its insertion columns (widest across all
 * reads) followed by one reference column, so every row comes out the same
 * length and stays aligned — except where an array block takes over, and
 * contributes one run of columns for the whole interval it covers.
 */
export function buildColumnLayout(start, end, insWidths, arrays = []) {
    const arrayByStart = new Map(arrays.map(a => [a.start, a]));
    const offsets = [];
    const breaks = [];
    let col = 0;
    let pos = start;
    while (pos < end) {
        const array = arrayByStart.get(pos);
        if (array) {
            const stop = Math.min(array.end, end);
            offsets.push(col);
            breaks.push(pos);
            col += array.width;
            for (let p = pos + 1; p < stop; p++) {
                offsets.push(col);
            }
            pos = stop;
        }
        else {
            offsets.push(col);
            const width = insWidths.get(pos) ?? 0;
            if (width) {
                breaks.push(pos);
            }
            col += width + 1;
            pos++;
        }
    }
    offsets.push(col);
    return {
        start,
        end,
        insWidths,
        arrays,
        offsets,
        totalColumns: col,
        arrayByStart,
        breaks,
    };
}
/** index of the first break at or after `pos` */
function breakIndex(breaks, pos) {
    let lo = 0;
    let hi = breaks.length;
    while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (breaks[mid] < pos) {
            lo = mid + 1;
        }
        else {
            hi = mid;
        }
    }
    return lo;
}
/** the array covering `pos`, when `pos` is strictly inside one */
function arrayContaining(arrays, pos) {
    return arrays.find(a => a.start < pos && pos < a.end);
}
/**
 * The reference positions a row is walked over, from inclusive to exclusive. A
 * trailing insertion is keyed one past the last position the read spans, so
 * that slot is in it.
 */
export function rowSpan(read, layout) {
    const { start, end, arrays } = layout;
    const lastPos = read.start + read.refChars.length;
    const from = Math.max(start, read.start);
    const to = Math.min(end, lastPos + 1);
    // a row that begins or ends inside an array does not span it, so it gets no
    // block; snapping past the block keeps the walk from emitting part of one
    const startsInside = arrayContaining(arrays, from);
    const endsInside = arrayContaining(arrays, to);
    return {
        from: startsInside ? Math.min(end, startsInside.end) : from,
        to: endsInside ? endsInside.start : to,
    };
}
/**
 * Lays a single row out across the whole region. Rows are typically a tiny
 * fraction of the region, so the columns on either side are filled in one shot
 * from the offsets rather than walked position by position — which works over
 * array blocks too, since the offsets already carry their width. Inside its own
 * span a row is walked only at the layout's breaks, and copied straight out of
 * `refChars` between them.
 */
export function renderRow(read, layout) {
    const { start, insWidths, offsets, totalColumns } = layout;
    const { arrayByStart, breaks } = layout;
    const lastPos = read.start + read.refChars.length;
    const { from, to } = rowSpan(read, layout);
    if (to <= from) {
        return ABSENT.repeat(totalColumns);
    }
    let ret = ABSENT.repeat(offsets[from - start]);
    let pos = from;
    let next = breakIndex(breaks, from);
    while (pos < to) {
        while (next < breaks.length && breaks[next] < pos) {
            next++;
        }
        const stop = Math.min(next < breaks.length ? breaks[next] : to, to);
        if (stop > pos) {
            // the walk never leaves the read's own bases except at its very last
            // position, which is the slot a trailing insertion is keyed in
            const cut = Math.min(stop, lastPos);
            ret += read.refChars.slice(pos - read.start, cut - read.start);
            ret += ABSENT.repeat(stop - cut);
            pos = stop;
            continue;
        }
        const array = arrayByStart.get(pos);
        if (array) {
            // a row with no allele here did not reach both edges of the array, or
            // skipped it through an N — either way it is not here, and a block of
            // deletion gaps would read as an allele it does not have
            ret += array.rowByName.get(read.name) ?? ABSENT.repeat(array.width);
            pos = Math.min(array.end, to);
            continue;
        }
        const refChar = pos < lastPos ? read.refChars[pos - read.start] : ABSENT;
        const ins = read.insertions.get(pos) ?? '';
        // insertion columns sit between pos - 1 and pos, so a read that is absent
        // on either side, an intron or its own first base, does not span them
        const spans = ins !== '' ||
            (refChar !== ABSENT &&
                pos > read.start &&
                read.refChars[pos - read.start - 1] !== ABSENT);
        const pad = spans ? SPANNED_GAP : ABSENT;
        ret += ins + pad.repeat(insWidths.get(pos) - ins.length) + refChar;
        pos++;
    }
    return ret + ABSENT.repeat(totalColumns - offsets[to - start]);
}
/**
 * The reference row's name, and the sample its row table entry gives it. Not
 * the sequence's own name: react-msaview prints a row's residues as
 * `<row>:<index>`, and `chr4:25` would read as a genome coordinate when it is an
 * index into the window.
 */
export const REFERENCE = 'reference';
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
    const names = getReadNames(features, [REFERENCE]);
    const parsed = features
        .map((f, i) => parseRead(f, names[i], sampleOf?.(i)))
        .sort(byStart);
    // The reference is laid out as a row like any other, which is what lets it be
    // one of the alleles an array block squares up rather than a thing the block
    // has to be compared against afterwards.
    const referenceName = sequence ? REFERENCE : undefined;
    const referenceRead = sequence
        ? {
            name: REFERENCE,
            sample: REFERENCE,
            start,
            refChars: sequence.toUpperCase(),
            insertions: new Map(),
        }
        : undefined;
    const clipped = clipInsertions(referenceRead ? [referenceRead, ...parsed] : parsed, start, end);
    // The intervals come from the reference and nothing here moves them. What
    // moves is each read's insertions, re-filed under the array they belong to
    // before anything is measured or laid out — see reanchorInsertions. Both
    // steps below read the re-anchored reads, so an insertion the array took over
    // is rendered inside its block and not also as a column of its own.
    const intervals = sequence
        ? mergeArrays(findReferenceArrays(sequence, start))
        : [];
    const normalized = normalizeInsertions(reanchorInsertions(clipped, intervals), intervals, start);
    const anchored = referenceRead
        ? mergeInsertionSites(normalized, intervals, {
            seq: referenceRead.refChars,
            start,
        })
        : normalized;
    const arrays = buildArrayBlocks(anchored, intervals);
    const ownedByArray = new Set();
    for (const array of arrays) {
        for (let pos = array.start; pos <= array.end; pos++) {
            ownedByArray.add(pos);
        }
    }
    const aligned = alignInsertionColumns(anchored, ownedByArray);
    // With several arrays in view the subject is the one the rows disagree most
    // about, since ordering rows by two copy numbers at once is not a thing rows
    // can do and an array every row agrees on orders nothing.
    const subject = arrays.reduce((best, array) => best && alleleSpread(best) >= alleleSpread(array) ? best : array, undefined);
    const insWidths = maxInsertionWidths(aligned, ownedByArray);
    const layout = buildColumnLayout(start, end, insWidths, arrays);
    return {
        reads: aligned,
        featureNames: names,
        layout,
        region: { refName, start, end },
        cellCount: aligned.length * layout.totalColumns,
        arrays,
        subject,
        referenceName,
        samples: [
            ...new Set(features.map((_, i) => sampleOf?.(i)).filter(s => s !== undefined)),
        ],
    };
}
export function renderRows({ reads, layout }) {
    return reads.map(r => renderRow(r, layout));
}
export function toFasta({ reads }, rows) {
    return reads.map((r, i) => `>${r.name}\n${rows[i]}\n`).join('');
}
export function renderTviewMsa(plan) {
    return toFasta(plan, renderRows(plan));
}
/**
 * What each row is, keyed by its name: the sample it came from and, where there
 * is a subject array, the copies it carries there and their length in bp.
 */
export function planRowData({ reads, subject }) {
    return Object.fromEntries(reads.map(({ name, sample }) => {
        const copies = subject?.copiesByName.get(name);
        const alleleBp = subject?.lengthByName.get(name);
        return [
            name,
            {
                ...(sample === undefined ? {} : { sample }),
                ...(copies === undefined ? {} : { copies }),
                ...(alleleBp === undefined ? {} : { alleleBp }),
            },
        ];
    }));
}
/** the value most of `values` share, the larger of two equally common */
function commonest(values) {
    const counts = new Map();
    for (const value of values) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0][0];
}
// A bracket is kept in the session and drawn in one strip, and a noisy window
// has an insertion site every few bases, so only the sites carrying the most
// inserted sequence are marked.
const MAX_INSERTION_BRACKETS = 100;
/**
 * A bracket over the runs of columns that are not one reference base: the
 * insertion sites, and each array block. Columns are the file's, 1-based.
 */
export function planHighlights({ reads, layout, region, referenceName, }) {
    const { start, offsets, insWidths, arrays } = layout;
    const n = (x) => x.toLocaleString('en-US');
    const column = (pos) => offsets[pos - start] + 1;
    const lengthsAt = new Map();
    for (const read of reads) {
        for (const [pos, ins] of read.insertions) {
            const lengths = lengthsAt.get(pos) ?? [];
            lengths.push(ins.replaceAll(SPANNED_GAP, '').length);
            lengthsAt.set(pos, lengths);
        }
    }
    const insertedBases = (pos) => (lengthsAt.get(pos) ?? []).reduce((a, b) => a + b, 0);
    const insertions = [...insWidths]
        .filter(([, width]) => width > 0)
        .sort((a, b) => insertedBases(b[0]) - insertedBases(a[0]) || a[0] - b[0])
        .slice(0, MAX_INSERTION_BRACKETS)
        .map(([pos, width]) => ({
        start: column(pos),
        end: column(pos) + width - 1,
        label: `+${commonest(lengthsAt.get(pos) ?? [width])}bp after ${region.refName}:${n(pos)}`,
    }));
    const blocks = arrays.map(array => {
        const copies = referenceName
            ? array.copiesByName.get(referenceName)
            : undefined;
        return {
            start: column(array.start),
            end: column(array.start) + array.width - 1,
            label: copies === undefined
                ? `(${array.unit})n`
                : `(${array.unit})x${copies} in the reference`,
        };
    });
    return [...insertions, ...blocks]
        .sort((a, b) => a.start - b.start)
        .map((h) => ({ ...h, mark: 'bracket' }));
}
export function buildTviewMsa(args) {
    const plan = planTviewMsa(args);
    return {
        msa: renderTviewMsa(plan),
        rowData: planRowData(plan),
        highlights: planHighlights(plan),
        insertionWidths: [...plan.layout.insWidths].sort((a, b) => a[0] - b[0]),
        region: plan.region,
        arrays: plan.arrays,
        subject: plan.subject,
    };
}
//# sourceMappingURL=tview.js.map