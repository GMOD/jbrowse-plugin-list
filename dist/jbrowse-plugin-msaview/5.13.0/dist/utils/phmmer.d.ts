import type { PhmmerDatabase } from '../LaunchMsaView/components/BlastQuery/consts';
import type { SearchBackend, SearchHit } from './homologSearch';
export interface PhmmerRow {
    accession: string;
    id: string;
    sciname: string;
    taxid?: number;
    title?: string;
    /** the matched envelope on the target, e.g. '503-912', absent if unparseable */
    range?: string;
    /** the row as phmmer aligned it, uppercased with '.' inserts turned into '-' */
    aligned: string;
}
export interface PhmmerAlignment {
    rows: PhmmerRow[];
    /**
     * the query, placed into the same columns. phmmer does not put the query in
     * its own output, so this is derived — see buildQueryRow.
     */
    queryRow: string;
}
/**
 * Human-facing link to a job, shown while it runs and on error.
 *
 * The category has to be sss: jdispatcher serves its shell with a 200 for any
 * category, so /pfa/ and /psa/ look fine to a fetch and render "Page Not Found"
 * in a browser.
 */
export declare function phmmerResultUrl(jobId: string): string;
/** EBI job ids are prefixed with the tool that made them */
export declare function isPhmmerJobId(jobId: string): boolean;
/**
 * Exported for testing against a captured .sto — the annotation names (RF, the
 * DE line's OS=/OX=) are the whole risk in this mapping, and nothing else in CI
 * would notice if HMMER or EBI changed one.
 */
export declare function parsePhmmerAlignment({ stockholm, query, }: {
    stockholm: string;
    query: string;
}): PhmmerAlignment;
export declare function queryPhmmer({ query, database, maxHits, onProgress, onRid, signal, }: {
    query: string;
    database: PhmmerDatabase;
    /** EBI's `nhits`, 100 when omitted */
    maxHits?: number;
    onProgress: (arg: string) => void;
    onRid: (arg: string) => void;
    signal?: AbortSignal;
}): Promise<{
    rows: PhmmerRow[];
    /**
     * the query, placed into the same columns. phmmer does not put the query in
     * its own output, so this is derived — see buildQueryRow.
     */
    queryRow: string;
    rid: string;
}>;
/** phmmer's rows as search hits: the aligned row is the hit's sequence. */
export declare function toSearchHits(rows: PhmmerRow[]): SearchHit[];
/**
 * phmmer as a search backend. It aligns every hit to a profile of the query as
 * it searches, so the result carries `queryRow` and no aligner runs after it.
 */
export declare const searchEbiPhmmer: SearchBackend;
