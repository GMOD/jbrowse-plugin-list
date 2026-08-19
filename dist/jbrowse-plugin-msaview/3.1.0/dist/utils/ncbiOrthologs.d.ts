export declare const defaultMaxSpecies = 100;
export interface OrthologRow {
    taxId: number;
    /** single-token id used identically in the FASTA, the tree and the domain GFF */
    label: string;
    scientificName: string;
    commonName?: string;
    geneId: string;
    /** accession.version */
    protein: string;
    sequence: string;
}
/**
 * A free-text gene reference -> NCBI gene id. A bare number is taken as the id
 * itself; anything else is searched as a gene name within the query taxon.
 * Several candidate identifiers are tried in order, because a JBrowse feature
 * carries whatever its GFF/BigBed had — `id()`, `name`, `gene_name` — and only
 * some of those are real symbols.
 */
export declare function resolveGeneId(candidates: string[], taxId: number): Promise<{
    geneId: string;
    matched: string;
} | undefined>;
/**
 * One ortholog gene per species, in NCBI's report order, capped at `limit`.
 *
 * `taxa` narrows the set when a caller wants specific species; omitted, every
 * species NCBI has an ortholog for is a candidate. `exclude` drops the query
 * taxon, which already has its own `<species>_query` row.
 */
export declare function fetchOrthologGenes(geneId: string, { taxa, exclude, limit, }?: {
    taxa?: Set<number>;
    exclude?: number;
    limit?: number;
}): Promise<{
    taxId: number;
    geneId: string;
    scientificName: string;
    commonName?: string;
}[]>;
/**
 * geneId -> representative protein accession: MANE Select where flagged, else
 * the longest isoform. A stable, comparable choice across species — picking
 * "the first" would silently vary with NCBI's ordering.
 */
export declare function fetchRepresentativeProteins(geneIds: string[]): Promise<Map<string, string>>;
/** accession (first header token) -> ungapped sequence, from a multi-FASTA. */
export declare function parseFasta(text: string): Map<string, string>;
/**
 * Sanitized, unique single-token labels used identically in the FASTA headers,
 * the tree leaf names and the domain GFF seq_ids — that identity is how the
 * viewer pairs a tree leaf to its alignment row to its domain track. Collisions
 * get a numeric suffix rather than silently overwriting a row.
 */
export declare function dedupeLabels(names: string[]): string[];
/**
 * The representative protein for a single gene, with its sequence. Used to
 * decide whether the user's own translated transcript is byte-identical to the
 * RefSeq protein — if it is, that accession's precomputed CDD domains apply to
 * the query row exactly, and if it isn't, they would land at an offset.
 */
export declare function fetchProteinForGene(geneId: string): Promise<{
    accession: string;
    sequence: string;
} | undefined>;
/**
 * The whole NCBI half of the pipeline: gene -> ortholog rows carrying labels,
 * accessions and sequences. Everything here is a precomputed lookup, so this
 * returns in seconds rather than the 10+ minutes a BLAST submission costs.
 */
export declare function fetchOrthologRows({ geneId, taxa, exclude, limit, onProgress, }: {
    geneId: string;
    taxa?: Set<number>;
    exclude?: number;
    limit?: number;
    onProgress: (arg: string) => void;
}): Promise<OrthologRow[]>;
