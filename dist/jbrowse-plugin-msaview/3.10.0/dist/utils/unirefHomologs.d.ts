import type { OrthologRow } from './ncbiOrthologs';
declare const unirefIdentities: readonly [50, 90];
export type UnirefIdentity = (typeof unirefIdentities)[number];
export declare const UNIPROT_ACCESSION: RegExp;
interface UniProtEntry {
    primaryAccession?: string;
    uniProtkbId?: string;
    entryType?: string;
    organism?: {
        scientificName?: string;
        commonName?: string;
        taxonId?: number;
    };
    proteinDescription?: {
        recommendedName?: {
            fullName?: {
                value?: string;
            };
        };
        submissionNames?: {
            fullName?: {
                value?: string;
            };
        }[];
    };
    sequence?: {
        value?: string;
        length?: number;
    };
}
export interface UnirefMember {
    accession: string;
    id: string;
    reviewed: boolean;
    taxId: number;
    scientificName: string;
    commonName?: string;
    title?: string;
    sequence: string;
}
export declare function parseEntry(entry: UniProtEntry): UnirefMember | undefined;
/**
 * The query as UniProt knows it. A candidate that already is a UniProt
 * accession is fetched directly; a gene symbol is searched in the query
 * organism, reviewed entries first.
 */
export declare function resolveUniProtEntry(candidates: string[], taxId: number, signal?: AbortSignal): Promise<UnirefMember | undefined>;
/**
 * The cluster's UniProtKB members, one per species: reviewed over unreviewed,
 * then longest. `taxa` narrows to those species, `exclude` drops one (the
 * query's own, which has its own row), `limit` caps the result.
 */
export declare function fetchClusterMembers({ clusterId, identity, referenceProteomesOnly, taxa, exclude, limit, onProgress, signal, }: {
    clusterId: string;
    identity: UnirefIdentity;
    referenceProteomesOnly?: boolean;
    taxa?: Set<number>;
    exclude?: number;
    limit?: number;
    onProgress?: (arg: string) => void;
    signal?: AbortSignal;
}): Promise<{
    total: number | undefined;
    rows: UnirefMember[];
}>;
export interface UnirefHomologs {
    query: UnirefMember;
    clusterId: string;
    /** how many UniProtKB entries the cluster listing held before the one-per-species pick */
    total?: number;
    rows: OrthologRow[];
}
/**
 * The whole UniRef half of the pipeline: gene or accession -> UniProt entry ->
 * cluster -> one member per species, carrying labels, accessions and
 * sequences. Three requests for a typical cluster, none of them a job.
 */
export declare function fetchUnirefHomologs({ candidates, taxId, identity, referenceProteomesOnly, taxa, exclude, limit, onProgress, signal, }: {
    candidates: string[];
    taxId: number;
    identity?: UnirefIdentity;
    referenceProteomesOnly?: boolean;
    taxa?: Set<number>;
    exclude?: number;
    limit?: number;
    onProgress: (arg: string) => void;
    signal?: AbortSignal;
}): Promise<UnirefHomologs>;
export {};
