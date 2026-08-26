import type { OrthologRow } from './ncbiOrthologs';
export interface PantherGenome {
    /** PANTHER's organism code, e.g. HUMAN, DROME */
    code: string;
    taxId: number;
    /** short common name, e.g. fruit_fly */
    name: string;
    /** scientific name */
    longName: string;
}
/**
 * `supportedgenomes` -> the code<->taxon map every other parse needs. PANTHER
 * names organisms by code only in ortholog results.
 */
export declare function parseGenomes(json: unknown): PantherGenome[];
export interface PantherGene {
    code: string;
    /** UniProt accession */
    accession: string;
    /** the source database's own id, e.g. HGNC=1773, FlyBase=FBgn0016131 */
    geneRef: string;
}
export interface PantherHit extends PantherGene {
    symbol?: string;
    /**
     * LDO = least diverged ortholog, PANTHER's pick of the one-to-one; O = any
     * other ortholog in a one-to-many or many-to-many family
     */
    type: 'LDO' | 'O';
}
/**
 * `matchortho` -> the query gene (PANTHER names it in every row) and one hit
 * per target gene. An unknown gene comes back under `unmapped_ids`; a gene with
 * no ortholog in the target set comes back as a bare `{ id }`.
 */
export declare function parseMatches(json: unknown): {
    unmapped: boolean;
    query?: PantherGene;
    hits: PantherHit[];
};
/**
 * One hit per organism, in first-seen order: the LDO where PANTHER named one,
 * else the first other ortholog it listed. A many-to-many family (the Hox
 * genes) has no LDO at all, so dropping to "first O" is what keeps those
 * species in the alignment.
 */
export declare function pickOnePerGenome(hits: PantherHit[]): PantherHit[];
/** `uniprotkb/accessions` -> accession -> sequence */
export declare function parseSequences(json: unknown): Map<string, string>;
/** The proteome list, fetched once per page and forgotten on failure. */
export declare function fetchGenomes(): Promise<PantherGenome[]>;
export interface PantherOrthologs {
    /** the candidate PANTHER recognised */
    matched: string;
    /** the query gene as PANTHER knows it, with its UniProt sequence */
    query?: PantherGene & {
        sequence: string;
    };
    rows: OrthologRow[];
}
/**
 * The whole PANTHER half of the pipeline: gene -> ortholog rows carrying
 * labels, accessions and sequences, plus the query gene's own protein for the
 * query row. Two lookups (genomes, orthologs), one taxonomy batch for the
 * labels, one UniProt batch for the sequences.
 *
 * `taxa`, `exclude` and `limit` mean what they mean for fetchOrthologRows:
 * `taxa` narrows the targets (omitted, every genome PANTHER has, in its order),
 * `exclude` drops the query taxon, `limit` caps the rows before their
 * sequences are fetched.
 */
export declare function fetchPantherOrthologs({ candidates, taxId, taxa, exclude, limit, onProgress, }: {
    candidates: string[];
    taxId: number;
    taxa?: Set<number>;
    exclude?: number;
    limit?: number;
    onProgress: (arg: string) => void;
}): Promise<PantherOrthologs>;
