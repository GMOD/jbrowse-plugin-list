import { jsonfetch } from '../../fetchUtils';
import { getDatabaseTypeForId, isRecognizedDatabaseId, stripTrailingVersion, } from '../utils/util';
// Re-export for backward compatibility
const UNIPROT_FIELDS = 'accession,id,gene_names,organism_name,protein_name,reviewed';
function mapApiResultToEntry(result) {
    return {
        accession: result.primaryAccession,
        id: result.uniProtkbId,
        geneName: result.genes?.[0]?.geneName?.value,
        organismName: result.organism?.commonName ?? result.organism?.scientificName,
        proteinName: result.proteinDescription?.recommendedName?.fullName?.value,
        isReviewed: result.entryType === 'UniProtKB reviewed (Swiss-Prot)',
    };
}
/**
 * Build UniProt xref query for a recognized database ID
 */
function buildXrefQuery(id) {
    const dbType = getDatabaseTypeForId(id);
    switch (dbType) {
        case 'ensembl':
            return `xref:ensembl-${id}`;
        case 'refseq':
            return `xref:refseq-${id}`;
        case 'ccds':
            return `xref:ccds-${id}`;
        case 'hgnc':
            return `xref:hgnc-${id.replace('HGNC:', '')}`;
        default:
            return undefined;
    }
}
async function searchUniProt(query, size = 10) {
    const url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}&fields=${UNIPROT_FIELDS}&size=${size}`;
    const data = (await jsonfetch(url));
    return data.results.map(mapApiResultToEntry);
}
async function searchByXref(id) {
    const query = buildXrefQuery(id);
    if (!query) {
        return { entries: [], error: undefined };
    }
    try {
        return { entries: await searchUniProt(query), error: undefined };
    }
    catch (e) {
        console.error(`xref search failed for ${id}:`, e);
        return { entries: [], error: e };
    }
}
function deduplicateEntries(entries) {
    const seen = new Set();
    const result = [];
    for (const entry of entries) {
        if (!seen.has(entry.accession)) {
            seen.add(entry.accession);
            result.push(entry);
        }
    }
    return result;
}
/**
 * Search UniProt for entries matching a gene, returning multiple results.
 * Tries multiple strategies in order of specificity:
 * 1. Recognized database IDs (Ensembl, RefSeq, CCDS, HGNC) via xref search
 * 2. Gene name search (fallback if no reviewed entries found)
 */
export async function searchUniProtEntries({ recognizedIds = [], geneId, geneName, organismId = 9606, }) {
    // Collect all IDs to search, including legacy geneId if applicable
    const idsToSearch = new Set(recognizedIds);
    const strippedGeneId = geneId ? stripTrailingVersion(geneId) : undefined;
    if (strippedGeneId && isRecognizedDatabaseId(strippedGeneId)) {
        idsToSearch.add(strippedGeneId);
    }
    // Search all xrefs in parallel
    const xrefResults = await Promise.all([...idsToSearch].map(searchByXref));
    let entries = deduplicateEntries(xrefResults.flatMap(r => r.entries));
    const xrefErrors = xrefResults.filter(r => r.error !== undefined);
    // Fallback: if no reviewed entries found, try gene name search
    let geneNameError;
    if (!entries.some(e => e.isReviewed) && geneName) {
        try {
            const query = `gene:${geneName}+AND+organism_id:${organismId}+AND+reviewed:true`;
            const geneNameResults = await searchUniProt(query, 5);
            entries = deduplicateEntries([...entries, ...geneNameResults]);
        }
        catch (e) {
            console.error(`gene name search failed for ${geneName}:`, e);
            geneNameError = e;
        }
    }
    // If we got no entries but every attempted lookup failed, surface the
    // underlying error rather than silently returning []. Otherwise consumers
    // see "No UniProt ID found" with no indication that the network failed.
    if (entries.length === 0) {
        const attempted = idsToSearch.size + (geneName ? 1 : 0);
        const failed = xrefErrors.length + (geneNameError ? 1 : 0);
        if (attempted > 0 && attempted === failed) {
            throw (geneNameError ?? xrefErrors[0]?.error);
        }
    }
    // Sort reviewed entries first
    return entries.toSorted((a, b) => Number(b.isReviewed) - Number(a.isReviewed));
}
