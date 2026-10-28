import type { BlastDatabase } from '../LaunchMsaView/components/BlastQuery/consts';
import type { SearchBackend, SearchHit } from './homologSearch';
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
 * EBI's hits as search hits. BLAST's alignments are pairwise, one hit at a
 * time, so the gaps come back off and an aligner gets bare sequences. Exported
 * for testing against a captured response: nothing else in CI would notice if
 * EBI renamed a field.
 */
export declare function normalizeEbiBlastHits(result: EbiBlastJson): SearchHit[];
/**
 * Human-facing link to a job, shown while it runs and on error — so it has to
 * be EBI's own results UI, not the REST result endpoint, which does not exist
 * yet at the moment the link is on screen.
 */
export declare function ebiBlastResultUrl(jobId: string): string;
export declare function queryEbiBlast({ query, blastDatabase, maxHits, onProgress, onRid, signal, }: {
    query: string;
    blastDatabase: BlastDatabase;
    /** rounded up to a count EBI accepts */
    maxHits?: number;
    onProgress: (arg: string) => void;
    onRid: (arg: string) => void;
    signal?: AbortSignal;
}): Promise<{
    rid: string;
    hits: SearchHit[];
}>;
export declare const searchEbiBlast: SearchBackend;
export {};
