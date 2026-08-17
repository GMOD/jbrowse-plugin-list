import { abortError, jsonfetch, timeout } from '../../fetchUtils';
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
export async function predict3Di({ aaSequence, signal, }) {
    // Clean the sequence - remove FASTA header, whitespace, stop codons, and non-AA chars
    const cleanSequence = aaSequence
        .split('\n')
        .filter(line => !line.startsWith('>'))
        .join('')
        .replace(/\s/g, '')
        .replace(/\*/g, '') // Remove stop codons before querying 3Di
        .toUpperCase()
        .replace(/[^ACDEFGHIKLMNPQRSTVWY]/g, ''); // Keep only valid amino acids
    const response = await fetch(`https://3di.foldseek.com/predict/${encodeURIComponent(cleanSequence)}`, { signal });
    if (!response.ok) {
        throw new Error(`3Di prediction failed: ${response.status} ${await response.text()}`);
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
    const response = await fetch('https://search.foldseek.com/api/ticket', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
        signal,
    });
    // Read the body as text first so a non-JSON error page (e.g. a gateway/500
    // HTML response) surfaces the real status instead of an opaque JSON
    // SyntaxError that hides it.
    const text = await response.text();
    if (!response.ok) {
        throw new Error(`Foldseek submission failed: ${response.status} ${text}`);
    }
    return JSON.parse(text);
}
async function pollFoldseekStatus({ ticketId, signal, }) {
    // Use the /tickets endpoint (plural) with POST
    const params = new URLSearchParams();
    params.append('tickets[]', ticketId);
    const response = await fetch('https://search.foldseek.com/api/tickets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
        signal,
    });
    if (!response.ok) {
        throw new Error(`Failed to poll ticket status: ${response.status}`);
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
        if (status.status === 'ERROR') {
            console.error('[Foldseek] Search error:', status);
            throw new Error(`Foldseek search failed: ${status.error ?? 'Unknown error'}`);
        }
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
        onStatusChange?.(`Search ${status.status.toLowerCase()}... (${elapsedSeconds()}s)`);
        await timeout(1000, signal);
    }
    throw new Error(`Foldseek search timed out after ${Math.round(timeoutMs / 1000)}s`);
}
