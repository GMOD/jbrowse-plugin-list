// SIFTS UniProt <-> PDB residue mapping.
//
// UniProt feature coordinates are positions in the UniProt canonical sequence.
// For an AlphaFold model that *is* the structure's own sequence, so a feature at
// UniProt position p sits at structure position p - 1. For an experimental PDB
// entry it is not: the deposited construct is usually a fragment, often with
// tags or engineered residues, so the two numberings differ by a per-segment
// offset (1TUP's p53 chain starts at UniProt 94; 6VXX's spike SEQRES 33 is
// UniProt 14). SIFTS is the authoritative alignment between the two, published
// per entity/chain by PDBe.
//
// `residue_number` in the PDBe response is the 1-based index into the entity's
// SEQRES, i.e. label_seq_id, which is exactly this plugin's structure-sequence
// position + 1 (see applyLociInteractivity.ts for the other place that boundary
// is crossed).
import { jsonfetch, timeout } from '../fetchUtils';
export function pdbeSiftsUrl(pdbId) {
    return `https://www.ebi.ac.uk/pdbe/api/mappings/uniprot/${pdbId.toLowerCase()}`;
}
const SIFTS_RETRY_DELAYS_MS = [1000, 3000];
/** SIFTS for an entry, retried twice: one failed request would otherwise
 * leave a fusion construct mapped onto its partner for the whole session. */
export async function fetchUniProtStructureMappings(pdbId) {
    for (let attempt = 0;; attempt++) {
        try {
            // bounded, since the view reports itself loading until SIFTS answers
            return parseUniProtStructureMappings(await jsonfetch(pdbeSiftsUrl(pdbId), {
                signal: AbortSignal.timeout(20_000),
            }));
        }
        catch (e) {
            const delay = SIFTS_RETRY_DELAYS_MS[attempt];
            if (delay === undefined) {
                throw e;
            }
            await timeout(delay);
        }
    }
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function finiteNumber(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}
function residueNumber(endpoint) {
    return isRecord(endpoint) ? finiteNumber(endpoint.residue_number) : undefined;
}
function parseSegment(mapping) {
    if (!isRecord(mapping)) {
        return undefined;
    }
    const entityId = finiteNumber(mapping.entity_id);
    const unpStart = finiteNumber(mapping.unp_start);
    const unpEnd = finiteNumber(mapping.unp_end);
    const structStart = residueNumber(mapping.start);
    const structEnd = residueNumber(mapping.end);
    return entityId === undefined ||
        unpStart === undefined ||
        unpEnd === undefined ||
        structStart === undefined ||
        structEnd === undefined
        ? undefined
        : {
            entityId: String(entityId),
            ...(typeof mapping.chain_id === 'string'
                ? { chainId: mapping.chain_id }
                : {}),
            unpStart,
            unpEnd,
            // SEQRES/label_seq_id is 1-based, structure positions are 0-based
            structStart: structStart - 1,
            structEnd: structEnd - 1,
        };
}
/**
 * Parses a PDBe `mappings/uniprot/{pdbId}` response into one entry per UniProt
 * accession. Unparseable segments are skipped rather than failing the whole
 * response — a chimera with one malformed segment still maps its other chains.
 * The response is keyed by pdb id, so the single entry is taken whatever its key.
 */
export function parseUniProtStructureMappings(json) {
    const entry = isRecord(json) ? Object.values(json)[0] : undefined;
    const uniprot = isRecord(entry) ? entry.UniProt : undefined;
    if (!isRecord(uniprot)) {
        return [];
    }
    const result = [];
    for (const [accession, value] of Object.entries(uniprot)) {
        const mappings = isRecord(value) ? value.mappings : undefined;
        const segments = Array.isArray(mappings)
            ? mappings.map(parseSegment).filter(s => s !== undefined)
            : [];
        if (segments.length > 0) {
            result.push({
                accession,
                name: isRecord(value) && typeof value.name === 'string'
                    ? value.name
                    : undefined,
                segments,
            });
        }
    }
    return result;
}
function coveredResidues(segments) {
    return segments.reduce((a, s) => a + (s.structEnd - s.structStart + 1), 0);
}
/**
 * The segments of one accession that describe this entity. SIFTS numbers
 * entities as the mmCIF does, and a PDB-format file loaded through Mol* numbers
 * them per chain (1H26.pdb's chain C is entity 2, which in SIFTS is cyclin A),
 * so a segment naming its chain is matched by chain.
 */
function segmentsForEntity(mapping, entity) {
    return dedupeSegments(mapping.segments.filter(s => s.chainId === undefined
        ? s.entityId === entity.entityId
        : entity.chains.includes(s.chainId)));
}
/**
 * Picks the UniProt entry that describes a given entity, with its segments
 * narrowed to that entity. Only the entity the plugin has mapped to the
 * transcript is relevant — a heteromer maps each of its chains to a different
 * accession, and using the wrong one would silently annotate the wrong protein.
 * When several accessions cover the same entity (a chimeric construct) the one
 * contributing the most residues wins.
 */
export function chooseUniProtMappingForEntity(mappings, entity) {
    if (entity === undefined) {
        return undefined;
    }
    let best;
    for (const mapping of mappings) {
        const segments = segmentsForEntity(mapping, entity);
        if (segments.length > 0 &&
            (!best || coveredResidues(segments) > coveredResidues(best.segments))) {
            best = { ...mapping, segments };
        }
    }
    return best;
}
const OWN_PSEUDOCOUNT = 5;
const MIN_OWN_IDENTITY = 0.5;
/**
 * Mapped structure positions that SIFTS assigns to a protein other than the
 * transcript's, on a chain that fuses two. Local alignment bridges a fusion
 * boundary, and on every GPCR fusion construct checked it scattered receptor
 * residues onto the partner, 33 of them onto T4 lysozyme in 2RH1.
 *
 * `mapped` is each mapped structure position and whether its pair is
 * identical. The transcript's own accession is the one whose covered positions
 * are most often identical, plus a pseudocount, as the chain picker scores
 * chains. A count of covered positions would not do: TP53's 11-residue peptide
 * fused to CDK2 covers 11 positions against 224 chance hits on the kinase, and
 * counting unmapped the peptide. Unless that accession reaches half identity
 * the transcript is taken to be neither protein, and nothing is unmapped.
 * Residues SIFTS assigns to no accession, such as tags, stay mapped.
 */
export function fusionPartnerPositions(mappings, entity, mapped) {
    const partners = new Set();
    const byAccession = entity
        ? mappings
            .map(m => segmentsForEntity(m, entity))
            .filter(segments => segments.length > 0)
        : [];
    if (byAccession.length < 2) {
        return partners;
    }
    const covers = (segments, pos) => segments.some(s => pos >= s.structStart && pos <= s.structEnd);
    const identity = byAccession.map(segments => {
        let covered = 0;
        let identical = 0;
        for (const [pos, same] of mapped) {
            if (covers(segments, pos)) {
                covered++;
                identical += same ? 1 : 0;
            }
        }
        return identical / (covered + OWN_PSEUDOCOUNT);
    });
    const ownIdentity = Math.max(...identity);
    if (ownIdentity < MIN_OWN_IDENTITY) {
        return partners;
    }
    const own = byAccession[identity.indexOf(ownIdentity)];
    for (const pos of mapped.keys()) {
        if (!covers(own, pos) &&
            byAccession.some(segments => segments !== own && covers(segments, pos))) {
            partners.add(pos);
        }
    }
    return partners;
}
// SIFTS lists one mapping per *chain*, so the several chains of a homodimer
// repeat the same entity-level correspondence. They collapse to one segment.
function dedupeSegments(segments) {
    const seen = new Set();
    return segments.filter(s => {
        const key = `${s.unpStart}-${s.unpEnd}-${s.structStart}-${s.structEnd}`;
        const isNew = !seen.has(key);
        seen.add(key);
        return isNew;
    });
}
/** 1-based UniProt position -> 0-based structure position, for an AlphaFold
 * model whose sequence is the UniProt sequence. */
export const identityUniProtPositionMap = uniprotPos => uniprotPos - 1;
export function makeUniProtPositionMap(segments) {
    return uniprotPos => {
        const segment = segments.find(s => uniprotPos >= s.unpStart && uniprotPos <= s.unpEnd);
        if (!segment) {
            return undefined;
        }
        const pos = segment.structStart + (uniprotPos - segment.unpStart);
        return pos <= segment.structEnd ? pos : undefined;
    };
}
