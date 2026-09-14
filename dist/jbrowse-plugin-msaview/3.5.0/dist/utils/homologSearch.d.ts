import type { SearchProgram } from '../LaunchMsaView/components/BlastQuery/consts';
import type { BlastHitDescription } from './types';
export interface SearchHit extends BlastHitDescription {
    /**
     * the hit's residues: aligned to the query (with gaps) when the result
     * carries `queryRow`, bare otherwise
     */
    sequence: string;
    /** the matched region of the target, for a target that matched more than once */
    range?: string;
}
export interface SearchResult {
    /** the job id at the service, for the link the panel shows while it runs */
    rid?: string;
    hits: SearchHit[];
    /**
     * the query as the search aligned it, gaps included, when the program aligns
     * as it searches. Absent, the hits are unaligned and an aligner runs next.
     */
    queryRow?: string;
}
export interface SearchRequest {
    query: string;
    database: string;
    maxHits?: number;
    onProgress: (arg: string) => void;
    onRid: (arg: string) => void;
    signal?: AbortSignal;
}
export type SearchBackend = (request: SearchRequest) => Promise<SearchResult>;
export declare const searchBackends: Record<SearchProgram, SearchBackend>;
