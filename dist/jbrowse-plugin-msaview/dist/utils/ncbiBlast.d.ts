import type { BlastDatabase, BlastProgram } from '../LaunchMsaView/components/NCBIBlastQuery/consts';
export declare function queryBlastFromRid({ rid, baseUrl, onProgress, }: {
    rid: string;
    baseUrl: string;
    onProgress: (arg: string) => void;
}): Promise<{
    rid: string;
    hits: {
        description: import("./types").BlastHitDescription[];
        hsps: {
            hseq: string;
        }[];
    }[];
}>;
export declare function queryBlast({ query, blastDatabase, blastProgram, baseUrl, onProgress, onRid, }: {
    query: string;
    blastDatabase: BlastDatabase;
    blastProgram: BlastProgram;
    baseUrl: string;
    onProgress: (arg: string) => void;
    onRid: (arg: string) => void;
}): Promise<{
    rid: string;
    hits: {
        description: import("./types").BlastHitDescription[];
        hsps: {
            hseq: string;
        }[];
    }[];
}>;
