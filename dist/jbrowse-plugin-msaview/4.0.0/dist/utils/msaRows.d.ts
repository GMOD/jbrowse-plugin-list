import type { SearchHit } from './homologSearch';
import type { TaxonomyInfo } from './taxonomyNames';
import type { BlastHitDescription } from './types';
/**
 * Turning search results into the rows the view is given, kept free of any
 * jbrowse or network import so the whole assembly can be run and checked
 * outside a browser — see test/phmmerLive.test.ts.
 */
export declare function buildRowMetadata(desc: BlastHitDescription, taxonomyInfo: Map<number, TaxonomyInfo>): Record<string, string>;
/**
 * A search result as the view receives it: FASTA whose first row is the query,
 * plus the per-row metadata keyed by the same names, which are also what the
 * tree's leaves are labelled with. With `queryRow` the hits are already in
 * columns and this IS the alignment; without it the rows are bare and the
 * FASTA is what an aligner is handed.
 */
export declare function buildSearchMsa({ hits, query, queryRow, taxonomyInfo, querySeqName, }: {
    hits: SearchHit[];
    query: string;
    queryRow?: string;
    taxonomyInfo: Map<number, TaxonomyInfo>;
    querySeqName?: string;
}): {
    msa: string;
    treeMetadata: Record<string, Record<string, string>>;
};
