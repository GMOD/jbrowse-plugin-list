import { abortError, httpError, jsonfetch, rawfetch, timeout } from 'p2s_mapper';
export const FOLDSEEK_DATABASES = [
    { id: 'pdb100', label: 'PDB (100% redundancy)' },
    { id: 'afdb-swissprot', label: 'AlphaFold DB (Swiss-Prot)' },
    { id: 'afdb50', label: 'AlphaFold DB (50% redundancy)' },
    { id: 'afdb-proteome', label: 'AlphaFold DB (Proteomes)' },
    { id: 'cath50', label: 'CATH (50% redundancy)' },
    { id: 'mgnify_esm30', label: 'MGnify ESM30' },
    { id: 'bfmd', label: 'BFMD' },
    { id: 'gmgcl_id', label: 'GMGCL' },
];
export const DEFAULT_DATABASES = [
    'pdb100',
    'afdb-swissprot',
];
export const FOLDSEEK_MAX_RESIDUES = 1200;
export function cleanFoldseekSequence(aaSequence) {
    return aaSequence
        .split('\n')
        .filter(line => !line.startsWith('>'))
        .join('')
        .toUpperCase()
        .replace(/[^ACDEFGHIKLMNPQRSTVWY]/g, '');
}
export function foldseekLengthProblem(aaSequence) {
    const { length } = cleanFoldseekSequence(aaSequence);
    return length > FOLDSEEK_MAX_RESIDUES
        ? `Foldseek's 3Di predictor takes at most ${FOLDSEEK_MAX_RESIDUES.toLocaleString('en-US')} residues and this sequence has ${length.toLocaleString('en-US')}. Trim it to the region you want to search.`
        : undefined;
}
export async function predict3Di({ aaSequence, signal, }) {
    const problem = foldseekLengthProblem(aaSequence);
    if (problem) {
        throw new Error(problem);
    }
    const cleanSequence = cleanFoldseekSequence(aaSequence);
    const url = `https://3di.foldseek.com/predict/${encodeURIComponent(cleanSequence)}`;
    const response = await rawfetch(url, { signal });
    if (!response.ok) {
        throw await httpError(response, url);
    }
    const di3Sequence = await response.text();
    // Remove any quotes, slashes, or whitespace from the response
    const cleanDi3 = di3Sequence
        .replace(/^["'/\s]+/, '')
        .replace(/["'/\s]+$/, '')
        .trim();
    return { aaSequence: cleanSequence, di3Sequence: cleanDi3 };
}
export async function submitFoldseekSearch({ aaSequence, di3Sequence, databases, signal, }) {
    // Submit both AA and 3Di sequences (with trailing newline like working example)
    const fastaContent = `>query\n${aaSequence}\n>3DI\n${di3Sequence}\n`;
    const params = new URLSearchParams();
    params.append('q', fastaContent);
    params.append('mode', '3diaa');
    params.append('email', '');
    for (const db of databases) {
        params.append('database[]', db);
    }
    const url = 'https://search.foldseek.com/api/ticket';
    const response = await rawfetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
        signal,
    });
    if (!response.ok) {
        throw await httpError(response, url);
    }
    // The server answers a refusal (RATELIMIT, MAINTENANCE) with a 200 and no
    // id, which used to be polled as ticket "undefined" for three minutes
    const text = await response.text();
    const ticket = parseTicket(text);
    if (!ticket) {
        throw new Error(`Foldseek did not accept the search: ${text.slice(0, 200)}`);
    }
    return ticket;
}
function parseTicket(text) {
    let body;
    try {
        body = JSON.parse(text);
    }
    catch {
        return undefined;
    }
    if (typeof body !== 'object' || body === null) {
        return undefined;
    }
    const id = Reflect.get(body, 'id');
    const status = Reflect.get(body, 'status');
    return typeof id === 'string' &&
        (status === 'PENDING' ||
            status === 'RUNNING' ||
            status === 'COMPLETE' ||
            status === 'ERROR')
        ? { id, status }
        : undefined;
}
async function pollFoldseekStatus({ ticketId, signal, }) {
    // Use the /tickets endpoint (plural) with POST
    const params = new URLSearchParams();
    params.append('tickets[]', ticketId);
    const url = 'https://search.foldseek.com/api/tickets';
    const response = await rawfetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
        signal,
    });
    if (!response.ok) {
        throw await httpError(response, url);
    }
    const results = (await response.json());
    // Return the first (and only) result
    const result = results[0];
    if (!result) {
        throw new Error('No ticket status returned');
    }
    return result;
}
async function getFoldseekResults({ ticketId, signal, }) {
    return jsonfetch(`https://search.foldseek.com/api/result/${ticketId}/0`, { signal });
}
export async function waitForFoldseekResults({ ticketId, onStatusChange, signal, }) {
    // Wall-clock budget, not a poll count: each round trips to the server and
    // then sleeps a second, so counting polls under-reports elapsed time by
    // however slow the server is — and the progress message read as seconds.
    const timeoutMs = 180_000;
    const startedAt = Date.now();
    const elapsedSeconds = () => Math.round((Date.now() - startedAt) / 1000);
    while (Date.now() - startedAt < timeoutMs) {
        if (signal?.aborted) {
            throw abortError(signal);
        }
        const status = await pollFoldseekStatus({ ticketId, signal });
        if (status.status === 'COMPLETE') {
            onStatusChange?.('Fetching results...');
            const apiResponse = await getFoldseekResults({ ticketId, signal });
            // Transform API response to our format
            const results = {
                query: apiResponse.queries[0] ?? { header: '', sequence: '' },
                results: apiResponse.results.map(r => ({
                    db: r.db,
                    alignments: r.alignments,
                })),
            };
            return results;
        }
        // the server also answers RATELIMIT, MAINTENANCE and UNKNOWN, none of
        // which a wait resolves
        if (status.status !== 'PENDING' && status.status !== 'RUNNING') {
            throw new Error(`Foldseek search failed: ${status.error ?? status.status}`);
        }
        onStatusChange?.(`Search ${status.status.toLowerCase()}... (${elapsedSeconds()}s)`);
        await timeout(1000, signal);
    }
    throw new Error(`Foldseek search timed out after ${Math.round(timeoutMs / 1000)}s`);
}
