import { isRecognizedDatabaseId, matchDbIdPattern } from 'p2s_mapper';
import { codingTranscripts, isGeneLikeType } from '../codingFeature';
/**
 * Pull an NCBI taxon id out of reference-sequence-track metadata. jb2hubs
 * assemblies expose it differently by source: UCSC golden-path spreads it flat
 * (`metadata.taxId`), GenArk nests the raw hub stanza (`metadata.ucsc.taxId`).
 * `taxonId` is accepted too. Returns a positive integer, or undefined when
 * absent/unparseable so callers can fall back to a default organism.
 */
export function extractTaxonId(metadata) {
    if (metadata === null || typeof metadata !== 'object') {
        return undefined;
    }
    const m = metadata;
    const ucsc = m.ucsc !== null && typeof m.ucsc === 'object'
        ? m.ucsc
        : undefined;
    const n = Number(m.taxId ?? m.taxonId ?? ucsc?.taxId);
    return Number.isFinite(n) && n > 0 ? n : undefined;
}
export function getId(val) {
    return val === undefined ? '' : val.id();
}
function firstString(...vals) {
    return vals.find((v) => typeof v === 'string') ?? '';
}
export function getTranscriptDisplayName(val) {
    return val === undefined ? '' : (val.get('name') ?? val.get('id') ?? '');
}
export function getGeneDisplayName(val) {
    return val === undefined
        ? ''
        : firstString(val.get('gene_name'), val.get('name'), val.get('id'));
}
/**
 * Parse dbxref attribute which can have formats like:
 * - "GeneID:1234,HGNC:HGNC:5678"
 * - "Dbxref=GeneID:1234"
 * - Array of strings
 */
function parseDbxref(dbxref) {
    if (!dbxref) {
        return [];
    }
    if (Array.isArray(dbxref)) {
        return dbxref.flatMap(item => typeof item === 'string' ? item.split(',') : []);
    }
    if (typeof dbxref === 'string') {
        return dbxref.split(',').map(s => s.trim());
    }
    return [];
}
/**
 * Extract recognized database IDs from dbxref entries
 * Returns IDs without their database prefix where applicable
 */
function extractIdsFromDbxref(dbxrefEntries) {
    const ids = [];
    for (const entry of dbxrefEntries) {
        // Handle formats like "Ensembl:ENST00000123456" or "RefSeq:NM_001234"
        const parts = entry.split(':');
        const lastPart = parts[parts.length - 1];
        if (lastPart && isRecognizedDatabaseId(lastPart)) {
            ids.push(lastPart);
        }
        // Also check if the whole entry is a recognized ID
        if (isRecognizedDatabaseId(entry)) {
            ids.push(entry);
        }
        // Handle HGNC format "HGNC:HGNC:12345" -> "HGNC:12345"
        if (entry.startsWith('HGNC:HGNC:')) {
            ids.push(entry.replace('HGNC:HGNC:', 'HGNC:'));
        }
        else if (entry.startsWith('HGNC:') && /^HGNC:\d+$/.test(entry)) {
            ids.push(entry);
        }
    }
    return [...new Set(ids)];
}
// New helper function to extract recognized DB IDs
export function findRecognizedDbIds(f) {
    if (!f) {
        return [];
    }
    const recognizedIds = [];
    // Check various feature attributes for recognized IDs
    const attributesToCheck = [
        f.get('ID'),
        f.get('id'),
        f.get('name'),
        f.get('Name'),
        f.get('transcript_id'),
        f.get('protein_id'),
        f.get('protAcc'), // RefSeq protein accession
        f.get('mrnaAcc'), // RefSeq mRNA accession
    ];
    for (const attr of attributesToCheck) {
        if (typeof attr === 'string') {
            const stripped = attr.replace(/\.[^./]+$/, ''); // Strip version
            if (isRecognizedDatabaseId(stripped)) {
                recognizedIds.push(stripped);
            }
        }
    }
    // Handle HGNC attribute which may be just the number (e.g., "10848" instead of "HGNC:10848")
    const hgnc = f.get('hgnc') ?? f.get('HGNC');
    if (typeof hgnc === 'string' || typeof hgnc === 'number') {
        const hgncStr = String(hgnc);
        if (/^\d+$/.test(hgncStr)) {
            recognizedIds.push(`HGNC:${hgncStr}`);
        }
        else if (matchDbIdPattern(hgncStr)?.db === 'hgnc') {
            recognizedIds.push(hgncStr);
        }
    }
    // Parse dbxref for additional IDs
    const dbxref = f.get('Dbxref') ?? f.get('dbxref') ?? f.get('db_xref');
    const dbxrefIds = extractIdsFromDbxref(parseDbxref(dbxref));
    for (const id of dbxrefIds) {
        recognizedIds.push(id);
    }
    return [...new Set(recognizedIds)];
}
/**
 * Extract all useful identifiers from a feature for UniProt lookup.
 * If the feature is a gene, prioritizes identifiers from its first transcript.
 * Otherwise, extracts identifiers from the feature itself.
 * geneId and geneName are always extracted from the parent feature 'f'.
 */
export function extractFeatureIdentifiers(f) {
    if (!f) {
        return { recognizedIds: [] };
    }
    let featureToProcess = f; // Default to the parent feature
    if (isGeneLikeType(f.get('type'))) {
        featureToProcess = codingTranscripts(f)[0] ?? f;
    }
    // --- Extracting Recognized IDs and UniProt ID from featureToProcess ---
    const recognizedIds = findRecognizedDbIds(featureToProcess);
    // Handle UniProt ID from feature attributes (trust that it's valid if present)
    const uniprotIdAttr = featureToProcess.get('uniprot') ??
        featureToProcess.get('uniprotId') ??
        featureToProcess.get('uniprotid') ??
        featureToProcess.get('UniProt');
    const uniprotId = typeof uniprotIdAttr === 'string' && uniprotIdAttr.length > 0
        ? uniprotIdAttr
        : undefined;
    // --- Get gene ID and name as fallbacks from the original parent feature 'f' ---
    // This assumes gene_id and gene_name are attributes of the parent gene, not the transcript.
    const geneId = f.get('gene_id') ?? f.get('ID');
    const geneName = f.get('gene_name') ?? f.get('gene') ?? f.get('name') ?? f.get('Name');
    return {
        recognizedIds: [...new Set(recognizedIds)], // Ensure unique IDs
        uniprotId,
        geneId: typeof geneId === 'string' ? geneId : undefined,
        geneName: typeof geneName === 'string' ? geneName : undefined,
    };
}
/** The translations that have arrived, as the records p2s_mapper ranks. */
export function isoformRecords(isoformSequences) {
    return Object.entries(isoformSequences ?? {}).map(([id, { seq }]) => ({
        id,
        seq,
    }));
}
/** Every transcript the dialog lists, in its order, carrying whichever
 * translations have arrived — an isoform with none is ranked as `noData`. */
export function rankableIsoforms(options, isoformSequences) {
    return options.map(f => ({
        id: f.id(),
        seq: isoformSequences?.[f.id()]?.seq,
    }));
}
