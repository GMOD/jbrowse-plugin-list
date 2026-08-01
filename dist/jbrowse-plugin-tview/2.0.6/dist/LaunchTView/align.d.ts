/**
 * Reads carrying the same insertion event usually differ slightly inside it
 * (sequencing error, or a real indel within the inserted allele). Laying each
 * one out left-justified puts those differences in different columns and the
 * shared event stops being readable. Aligning the inserted sequences against
 * each other fixes that.
 *
 * This is deliberately local to one reference position: the insertion still
 * occupies "as many columns as the widest gapped sequence", which is the only
 * thing buildColumnToRefPos knows about, so the column <-> reference mapping is
 * untouched.
 */
/**
 * Center-star multiple alignment of the sequences inserted at one reference
 * position. Returns each distinct input mapped to a gapped version, all of the
 * same length. Returns an empty map when there is nothing to gain (a single
 * distinct sequence) or when the site is too large to be worth aligning; the
 * caller then keeps the sequences as-is and left-justifies them.
 */
export declare function alignInsertions(seqs: string[]): Map<string, string>;
