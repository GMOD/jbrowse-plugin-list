import type { BlastHit } from './types';
import type { BlastDatabase } from '../LaunchMsaView/components/BlastQuery/consts';
/**
 * The subset of EBI's ncbiblast JSON result this plugin reads. The service
 * returns a great deal more per hit (urls, bit scores, e-values, the match
 * string); only what the MSA rows are built from is typed here.
 */
interface EbiBlastJson {
    hits?: {
        hit_acc?: string;
        hit_id?: string;
        hit_desc?: string;
        /** the UniProt fields are absent on hits from non-UniProt databases */
        hit_os?: string;
        hit_uni_de?: string;
        hit_uni_os?: string;
        /** NCBI taxon id, delivered as a string */
        hit_uni_ox?: string;
        hit_hsps?: {
            hsp_hseq?: string;
        }[];
    }[];
}
/**
 * Map EBI's hit shape onto the normalized one. Exported for testing against a
 * captured response — the field names are the whole risk here, and nothing else
 * in CI would notice if EBI renamed one.
 */
export declare function normalizeEbiBlastHits(result: EbiBlastJson): BlastHit[];
/**
 * Human-facing link to a job, shown while it runs and on error — so it has to
 * be EBI's own results UI, not the REST result endpoint, which does not exist
 * yet at the moment the link is on screen.
 */
export declare function ebiBlastResultUrl(jobId: string): string;
export declare function queryEbiBlastFromJobId({ jobId, onProgress, }: {
    jobId: string;
    onProgress: (arg: string) => void;
}): Promise<{
    rid: string;
    hits: BlastHit[];
}>;
export declare function queryEbiBlast({ query, blastDatabase, onProgress, onRid, }: {
    query: string;
    blastDatabase: BlastDatabase;
    onProgress: (arg: string) => void;
    onRid: (arg: string) => void;
}): Promise<{
    rid: string;
    hits: BlastHit[];
}>;
export {};
