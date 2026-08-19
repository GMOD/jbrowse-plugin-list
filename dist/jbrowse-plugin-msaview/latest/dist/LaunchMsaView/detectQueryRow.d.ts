/**
 * Which row of a pasted alignment is the gene the user launched from.
 *
 * The MsaView needs that row name to tie alignment columns back to genome
 * coordinates, and until now the user typed it. Nothing validates a typo: the
 * view opens, renders, and simply never navigates or highlights, which reads as
 * a broken feature rather than a wrong field. Meanwhile the plugin already
 * knows the protein sequence it sent to BLAST, so it can find the row by
 * sequence instead of asking.
 *
 * NCBI and EBI both rename the query on the way through -- COBALT emits
 * `Query_1`, EBI's aligners carry the accession -- so the name is no help. The
 * residues are, and they survive every rename.
 */
export type MatchQuality = 'exact' | 'partial' | 'similar';
export interface QueryRowMatch {
    name: string;
    quality: MatchQuality;
    /** identity over the compared region, 0-1 */
    identity: number;
}
export declare function detectQueryRow(msaText: string, proteinSequence: string): QueryRowMatch | undefined;
export declare function getMsaRowNames(msaText: string): string[];
