/** One contiguous UniProt <-> structure correspondence for a single entity.
 * `unp*` are 1-based UniProt positions; `struct*` are 0-based inclusive
 * structure-sequence positions, this plugin's native coordinate. */
export interface UniProtStructureSegment {
    entityId: string;
    /** author chain id, when the response names it */
    chainId?: string;
    unpStart: number;
    unpEnd: number;
    structStart: number;
    structEnd: number;
}
export interface UniProtStructureMapping {
    accession: string;
    /** UniProt entry name, e.g. "P53_HUMAN" */
    name?: string;
    segments: UniProtStructureSegment[];
}
/**
 * Maps a 1-based UniProt position to a 0-based structure-sequence position.
 * Returns undefined for positions outside the modeled region, so callers drop
 * the feature instead of drawing it somewhere misleading.
 */
export type MapUniProtPosition = (uniprotPos: number) => number | undefined;
export declare function pdbeSiftsUrl(pdbId: string): string;
/** SIFTS for an entry, retried twice: one failed request would otherwise
 * leave a fusion construct mapped onto its partner for the whole session. */
export declare function fetchUniProtStructureMappings(pdbId: string): Promise<UniProtStructureMapping[]>;
/**
 * Parses a PDBe `mappings/uniprot/{pdbId}` response into one entry per UniProt
 * accession. Unparseable segments are skipped rather than failing the whole
 * response — a chimera with one malformed segment still maps its other chains.
 * The response is keyed by pdb id, so the single entry is taken whatever its key.
 */
export declare function parseUniProtStructureMappings(json: unknown): UniProtStructureMapping[];
/** The entity a SIFTS segment is matched against: its mmCIF id and the author
 * chains carrying it. */
export interface SegmentEntity {
    entityId: string;
    chains: readonly string[];
}
/**
 * Picks the UniProt entry that describes a given entity, with its segments
 * narrowed to that entity. Only the entity the plugin has mapped to the
 * transcript is relevant — a heteromer maps each of its chains to a different
 * accession, and using the wrong one would silently annotate the wrong protein.
 * When several accessions cover the same entity (a chimeric construct) the one
 * contributing the most residues wins.
 */
export declare function chooseUniProtMappingForEntity(mappings: UniProtStructureMapping[], entity: SegmentEntity | undefined): UniProtStructureMapping | undefined;
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
export declare function fusionPartnerPositions(mappings: UniProtStructureMapping[], entity: SegmentEntity | undefined, mapped: ReadonlyMap<number, boolean>): Set<number>;
/** 1-based UniProt position -> 0-based structure position, for an AlphaFold
 * model whose sequence is the UniProt sequence. */
export declare const identityUniProtPositionMap: MapUniProtPosition;
export declare function makeUniProtPositionMap(segments: UniProtStructureSegment[]): MapUniProtPosition;
