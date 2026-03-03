import { jsonfetch, timeout } from '../../fetchUtils';
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
export async function predict3Di(aaSequence) {
    // Clean the sequence - remove FASTA header, whitespace, stop codons, and non-AA chars
    const cleanSequence = aaSequence
        .split('\n')
        .filter(line => !line.startsWith('>'))
        .join('')
        .replace(/\s/g, '')
        .replace(/\*/g, '') // Remove stop codons before querying 3Di
        .toUpperCase()
        .replace(/[^ACDEFGHIKLMNPQRSTVWY]/g, ''); // Keep only valid amino acids
    const response = await fetch(`https://3di.foldseek.com/predict/${encodeURIComponent(cleanSequence)}`);
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
export async function submitFoldseekSearch(aaSequence, di3Sequence, databases) {
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
    });
    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(`Foldseek submission failed: ${response.status} ${JSON.stringify(responseData)}`);
    }
    return responseData;
}
export async function pollFoldseekStatus(ticketId) {
    // Use the /tickets endpoint (plural) with POST
    const params = new URLSearchParams();
    params.append('tickets[]', ticketId);
    const response = await fetch('https://search.foldseek.com/api/tickets', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
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
export async function getFoldseekResults(ticketId) {
    const result = await jsonfetch(`https://search.foldseek.com/api/result/${ticketId}/0`);
    return result;
}
export async function waitForFoldseekResults(ticketId, databases, onStatusChange) {
    const maxAttempts = 180;
    let attempts = 0;
    while (attempts < maxAttempts) {
        const status = await pollFoldseekStatus(ticketId);
        if (status.status === 'ERROR') {
            console.error('[Foldseek] Search error:', status);
            throw new Error(`Foldseek search failed: ${status.error ?? 'Unknown error'}`);
        }
        if (status.status === 'COMPLETE') {
            onStatusChange?.('Fetching results...');
            const apiResponse = await getFoldseekResults(ticketId);
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
        onStatusChange?.(`Search ${status.status.toLowerCase()}... (${attempts + 1}s)`);
        await timeout(1000);
        attempts++;
    }
    throw new Error('Foldseek search timed out');
}
//# sourceMappingURL=foldseekApi.js.map