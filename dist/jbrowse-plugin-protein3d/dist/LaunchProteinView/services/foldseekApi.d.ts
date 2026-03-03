export declare const FOLDSEEK_DATABASES: readonly [{
    readonly id: "pdb100";
    readonly label: "PDB (100% redundancy)";
}, {
    readonly id: "afdb-swissprot";
    readonly label: "AlphaFold DB (Swiss-Prot)";
}, {
    readonly id: "afdb50";
    readonly label: "AlphaFold DB (50% redundancy)";
}, {
    readonly id: "afdb-proteome";
    readonly label: "AlphaFold DB (Proteomes)";
}, {
    readonly id: "cath50";
    readonly label: "CATH (50% redundancy)";
}, {
    readonly id: "mgnify_esm30";
    readonly label: "MGnify ESM30";
}, {
    readonly id: "bfmd";
    readonly label: "BFMD";
}, {
    readonly id: "gmgcl_id";
    readonly label: "GMGCL";
}];
export type FoldseekDatabaseId = (typeof FOLDSEEK_DATABASES)[number]['id'];
export declare const DEFAULT_DATABASES: FoldseekDatabaseId[];
export interface FoldseekTicketResponse {
    id: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETE' | 'ERROR';
    error?: string;
}
export interface FoldseekAlignment {
    target: string;
    seqId?: number;
    alnLength?: number;
    mismatches?: number;
    gapsopened?: number;
    qStartPos?: number;
    qEndPos?: number;
    qLen?: number;
    qAln?: string;
    dbStartPos?: number;
    dbEndPos?: number;
    dbLen?: number;
    dbAln?: string;
    prob?: number;
    eval?: number;
    score?: number;
    tCa?: string;
    tSeq?: string;
    taxId?: number;
    taxName?: string;
    query?: string;
}
export interface FoldseekDatabaseResult {
    db: string;
    alignments?: ((FoldseekAlignment | undefined)[] | undefined)[];
}
export interface FoldseekResult {
    query: {
        header: string;
        sequence: string;
    };
    results: FoldseekDatabaseResult[];
}
export declare function predict3Di(aaSequence: string): Promise<{
    aaSequence: string;
    di3Sequence: string;
}>;
export declare function submitFoldseekSearch(aaSequence: string, di3Sequence: string, databases: FoldseekDatabaseId[]): Promise<FoldseekTicketResponse>;
export declare function pollFoldseekStatus(ticketId: string): Promise<FoldseekTicketResponse>;
interface FoldseekApiResponse {
    mode: string;
    queries: {
        header: string;
        sequence: string;
    }[];
    results: {
        db: string;
        alignments: FoldseekAlignment[][];
        taxonomyreports: unknown[];
    }[];
}
export declare function getFoldseekResults(ticketId: string): Promise<FoldseekApiResponse>;
export declare function waitForFoldseekResults(ticketId: string, databases: FoldseekDatabaseId[], onStatusChange?: (status: string) => void): Promise<FoldseekResult>;
export {};
