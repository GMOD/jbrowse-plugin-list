import type { PhmmerRow } from './phmmer';
import type { TaxonomyInfo } from './taxonomyNames';
import type { BlastHitDescription } from './types';
/**
 * Turning search results into the rows the view is given, kept free of any
 * jbrowse or network import so the whole assembly can be run and checked
 * outside a browser — see test/phmmerLive.test.ts.
 */
export declare function buildRowMetadata(desc: BlastHitDescription, taxonomyInfo: Map<number, TaxonomyInfo>): Record<string, string>;
/**
 * One target can match the query in several places and phmmer emits a row per
 * matched envelope — four for lamprey albumin against human albumin, which has
 * three domains. Those rows share an accession and so would share a name, and
 * duplicate names silently collapse rows in both the MSA and the tree, so the
 * envelope disambiguates them.
 */
export declare function makeRowNames(rows: PhmmerRow[], taxonomyInfo: Map<number, TaxonomyInfo>): string[];
/**
 * The phmmer alignment as the view receives it: aligned FASTA whose first row
 * is the query, plus the per-row metadata keyed by the same names, which are
 * also what the tree's leaves are labelled with.
 */
export declare function buildPhmmerMsa({ rows, queryRow, taxonomyInfo, querySeqName, }: {
    rows: PhmmerRow[];
    queryRow: string;
    taxonomyInfo: Map<number, TaxonomyInfo>;
    querySeqName?: string;
}): {
    msa: string;
    treeMetadata: Record<string, Record<string, string>>;
};
