import type { ReadLayout } from './readLayout';
import type { ReferenceArray } from './repeats';
/**
 * A tandem array laid out as one block of columns per copy, replacing the
 * reference columns the array covers.
 *
 * The interval comes from the reference and the unit comes with it, so every
 * row is measured over the same span against the same unit. That is what makes
 * the counts comparable: a read's allele is what it has between here and here,
 * whatever the aligner did with the gap, and the reference is just the row whose
 * allele the coordinates are named after.
 */
export interface ArrayBlock {
    /** reference position the array starts at, inclusive */
    start: number;
    /** reference position the array ends at, exclusive */
    end: number;
    period: number;
    unit: string;
    /** columns the block occupies */
    width: number;
    /** columns each copy occupies, left to right; sums to `width` */
    unitWidths: number[];
    /** gapped block, by row name; only rows whose allele could be measured */
    rowByName: Map<string, string>;
    /** copies carried, by row name */
    copiesByName: Map<string, number>;
    /** allele length in bp, by row name */
    lengthByName: Map<string, number>;
}
/**
 * What one row has between two reference positions: its matched bases, plus
 * whatever it inserted inside, minus whatever it deleted.
 *
 * This is the measurement the insertion-anchored reading cannot make. An indel
 * inside an array has no unique placement, so two reads carrying the same allele
 * can disagree about which reference position it is inserted at and by how much;
 * summed over the interval, those choices cancel and both come back the same
 * length. Undefined when the row does not reach both edges — copies cannot be
 * counted from a read that stops inside the array, and guessing from a partial
 * one is how a truncated read reads as a contracted allele.
 */
export declare function extractAllele(read: ReadLayout, start: number, end: number): string | undefined;
/** Reference positions an array owns, including the insertion slot at its right edge. */
export declare function arrayInsertionKeys(array: {
    start: number;
    end: number;
}): number[];
/**
 * Widen each array to cover the insertions the aligner anchored just outside it
 * that are made of the array's own unit.
 *
 * An allele is measured over a reference interval, which fixes the "one array
 * reports as several sites" problem for indels the aligner placed *inside* the
 * interval. It does not fix the ones it placed just outside: an aligner is free
 * to anchor an expansion at the base before the array starts, and there the
 * insertion is not part of any allele — it is left to become its own run of
 * insertion columns, and the read it belongs to is measured as if it carried
 * the reference allele. Both halves of that are wrong, and they are not rare:
 * at ATXN3 the aligner anchored 60 of 162 reads' expansions one base outside
 * the array, and at ABCA7 a 1207bp allele 19 bases outside.
 *
 * What is absorbed is decided by the inserted sequence, not by the count of
 * reads carrying it — a single read's expansion is as real as fifty, and the
 * whole point of measuring over an interval is that it does not need a vote.
 * Widening the interval costs every row the few reference bases in between,
 * which they all pay equally, so the counts stay comparable.
 */
export declare function absorbAdjacentInsertions(reads: ReadLayout[], arrays: ReferenceArray[]): {
    start: number;
    end: number;
    period: number;
    unit: string;
}[];
/**
 * Lay every row's allele out unit-per-block, one block per array.
 *
 * Arrays whose alleles are all one length still get a block: squaring the copies
 * up against each other is what turns "this row is 63 bases long" into "this row
 * has 21 copies and the 12th one differs", and that is true whether or not the
 * rows disagree.
 */
export declare function buildArrayBlocks(reads: ReadLayout[], arrays: ReferenceArray[]): ArrayBlock[];
