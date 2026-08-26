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
/**
 * The picker's whole answer for a pasted alignment: its row names, and which of
 * them is the query.
 *
 * One function rather than two because there is one parse. Both answers were
 * wanted on every keystroke in the paste box, and asking separately parsed a
 * few-hundred-row alignment twice per character.
 */
export function findQueryRow(msaText, proteinSequence) {
    if (!msaText.trim()) {
        return { names: [] };
    }
    let parsed;
    try {
        parsed = parseMSA(msaText);
    }
    catch {
        // a half-pasted alignment throws here on every keystroke; the caller shows
        // the field rather than an error
        return { names: [] };
    }
    const names = parsed.getNames();
    const query = normalize(proteinSequence);
    return { names, match: query ? bestMatch(parsed, names, query) : undefined };
}
function bestMatch(parsed, names, query) {
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
    // an exact match returns above, so only these two can be here
    const order = ['partial', 'similar'];
    return candidates.sort((a, b) => order.indexOf(a.quality) - order.indexOf(b.quality) ||
        b.identity - a.identity)[0];
}
