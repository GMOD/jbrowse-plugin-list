/** One contiguous UniProt <-> structure correspondence for a single entity.
 * `unp*` are 1-based UniProt positions; `struct*` are 0-based inclusive
 * structure-sequence positions, this plugin's native coordinate. */
export interface UniProtStructureSegment {
    entityId: string;
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
/**
 * Parses a PDBe `mappings/uniprot/{pdbId}` response into one entry per UniProt
 * accession. Unparseable segments are skipped rather than failing the whole
 * response — a chimera with one malformed segment still maps its other chains.
 * The response is keyed by pdb id, so the single entry is taken whatever its key.
 */
export declare function parseUniProtStructureMappings(json: unknown): UniProtStructureMapping[];
/**
 * Picks the UniProt entry that describes a given entity, with its segments
 * narrowed to that entity. Only the entity the plugin has mapped to the
 * transcript is relevant — a heteromer maps each of its chains to a different
 * accession, and using the wrong one would silently annotate the wrong protein.
 * When several accessions cover the same entity (a chimeric construct) the one
 * contributing the most residues wins.
 */
export declare function chooseUniProtMappingForEntity(mappings: UniProtStructureMapping[], entityId: string | undefined): UniProtStructureMapping | undefined;
/** 1-based UniProt position -> 0-based structure position, for an AlphaFold
 * model whose sequence is the UniProt sequence. */
export declare const identityUniProtPositionMap: MapUniProtPosition;
export declare function makeUniProtPositionMap(segments: UniProtStructureSegment[]): MapUniProtPosition;
