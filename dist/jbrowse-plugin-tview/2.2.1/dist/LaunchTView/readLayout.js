import { newickSafe } from './sampleTree';
/**
 * Only '-' and '.' are treated as gaps by react-msaview (anything else counts
 * as a base in the conservation track and column stats), so the two of them
 * carry the whole vocabulary for "no base here". They are split by meaning:
 *
 * - SPANNED_GAP: the read covers this reference position but aligns no base to
 *   it, i.e. a deletion, or padding in an insertion column
 * - ABSENT: the read is not here at all, i.e. outside its bounds, or skipping
 *   over the position through an N (an intron, not a deleted allele)
 */
export const SPANNED_GAP = '-';
export const ABSENT = '.';
const cigarRegex = /([MIDNSHPX=])/;
export const byStart = (a, b) => a.start - b.start;
export function parseCigar(cigar) {
    return cigar.split(cigarRegex).slice(0, -1);
}
export function parseRead(feature, name, sample) {
    const seq = feature.get('seq');
    const ops = parseCigar(feature.get('CIGAR'));
    const start = feature.get('start');
    const insertions = new Map();
    let refChars = '';
    let seqOffset = 0;
    for (let i = 0; i < ops.length; i += 2) {
        const len = +ops[i];
        const op = ops[i + 1];
        if (op === 'S') {
            seqOffset += len;
        }
        else if (op === 'I') {
            // consecutive I ops (e.g. 3M2I3I3M) land on the same reference position
            const pos = start + refChars.length;
            const prev = insertions.get(pos) ?? '';
            insertions.set(pos, prev + seq.slice(seqOffset, seqOffset + len));
            seqOffset += len;
        }
        else if (op === 'D') {
            refChars += SPANNED_GAP.repeat(len);
        }
        else if (op === 'N') {
            refChars += ABSENT.repeat(len);
        }
        else if (op === 'M' || op === 'X' || op === '=') {
            refChars += seq.slice(seqOffset, seqOffset + len);
            seqOffset += len;
        }
        // H and P consume neither the read sequence nor the reference
    }
    // sanitized here, the same way getReadNames sanitizes the prefix it builds
    // from it, so the clade label and the leaves inside it are one string
    return {
        name,
        sample: sample === undefined ? undefined : newickSafe(sample),
        start,
        refChars,
        insertions,
    };
}
/**
 * Reads are fetched by overlap, so they carry insertions on either side of the
 * region. Those get no columns and are never rendered, so dropping them keeps
 * the pairwise alignment below off the wasted sites entirely.
 */
export function clipInsertions(reads, start, end) {
    return reads.map(read => ({
        ...read,
        insertions: new Map([...read.insertions].filter(([pos]) => pos >= start && pos < end)),
    }));
}
function mateSuffix(flags) {
    return flags === undefined || !(flags & 1) ? '' : flags & 64 ? '/1' : '/2';
}
/**
 * MSA rows are keyed by name, so mates and duplicate names need disambiguating.
 * With several samples loaded at once the same read name can also arrive twice
 * from two files, which the sample prefix separates before the counter has to.
 *
 * The name is made Newick-safe here rather than where the tree is written,
 * because the tree names the same rows the FASTA does and the two have to agree
 * exactly. '|' separates the parts because ':' opens a branch length.
 */
export function getReadNames(features, sampleOf) {
    const counts = new Map();
    return features.map((f, i) => {
        const sample = sampleOf?.(i);
        const prefix = sample ? `${newickSafe(sample)}|` : '';
        const name = newickSafe(String(f.get('name')));
        const base = `${prefix}${name}${mateSuffix(f.get('flags'))}`;
        const n = (counts.get(base) ?? 0) + 1;
        counts.set(base, n);
        return n === 1 ? base : `${base}_${n}`;
    });
}
//# sourceMappingURL=readLayout.js.map