import { getUngappedSequence, parseMSA } from 'msa-parsers';
/**
 * A stop codon is present in the transcript's translation and absent from
 * anything an aligner returns, and case is not meaningful in either.
 */
function normalize(seq) {
    return seq
        .replaceAll('*', '')
        .replaceAll('-', '')
        .replaceAll('.', '')
        .toUpperCase();
}
function identityOverOverlap(a, b) {
    const len = Math.min(a.length, b.length);
    if (len === 0) {
        return 0;
    }
    let same = 0;
    for (let i = 0; i < len; i++) {
        if (a[i] === b[i]) {
            same++;
        }
    }
    return same / len;
}
/**
 * Below this, a "best" row is not a match at all -- an alignment of homologs is
 * full of rows in the 40-70% range, and picking the top one would silently wire
 * the view to a paralog from another species.
 */
const SIMILARITY_FLOOR = 0.9;
/**
 * How much of the query a contained row has to cover. A short fragment is a
 * substring of almost any protein, so without a floor the first few residues of
 * a half-pasted alignment match the query and the field fills in with a row the
 * user is still typing.
 */
const PARTIAL_COVERAGE_FLOOR = 0.5;
export function detectQueryRow(msaText, proteinSequence) {
    const query = normalize(proteinSequence);
    if (!query || !msaText.trim()) {
        return undefined;
    }
    let names;
    let parsed;
    try {
        const msa = parseMSA(msaText);
        names = msa.getNames();
        parsed = msa;
    }
    catch {
        // a half-pasted alignment throws here on every keystroke; the caller shows
        // the field rather than an error
        return undefined;
    }
    const candidates = [];
    for (const name of names) {
        const row = normalize(getUngappedSequence(parsed.getRow(name)));
        if (!row) {
            continue;
        }
        if (row === query) {
            // nothing beats an exact match, and a second one would be a duplicate row
            return { name, quality: 'exact', identity: 1 };
        }
        // BLAST reports the aligned region, so the row is often the query trimmed
        // at one or both ends rather than the whole protein
        if (query.includes(row) || row.includes(query)) {
            const coverage = Math.min(row.length, query.length) / Math.max(row.length, query.length);
            if (coverage >= PARTIAL_COVERAGE_FLOOR) {
                candidates.push({ name, quality: 'partial', identity: coverage });
            }
            continue;
        }
        const identity = identityOverOverlap(row, query);
        if (identity >= SIMILARITY_FLOOR) {
            candidates.push({ name, quality: 'similar', identity });
        }
    }
    const order = ['exact', 'partial', 'similar'];
    return candidates.sort((a, b) => order.indexOf(a.quality) - order.indexOf(b.quality) ||
        b.identity - a.identity)[0];
}
export function getMsaRowNames(msaText) {
    if (!msaText.trim()) {
        return [];
    }
    try {
        return parseMSA(msaText).getNames();
    }
    catch {
        return [];
    }
}
