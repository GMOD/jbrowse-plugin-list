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
/**
 * `ins`, inserted before reference position `from`, rewritten as an insertion
 * before `to` — or undefined when the read's own bases do not allow it.
 *
 * An insertion has no unique position. `S` before a base `b` and `rotate(S)`
 * after it spell the same read, so an aligner is free to anchor an expansion
 * outside the array it belongs to, and at ATXN3 it did exactly that for most of
 * the reads carrying one. Walking an indel through that equivalence class is
 * the standard normalization for it (Tan, Abecasis & Kang, "Unified
 * representation of genetic variants", Bioinformatics 31, 2015,
 * doi:10.1093/bioinformatics/btv112, which walks left; this walks toward the
 * array, the same operation with the array as the canonical anchor).
 *
 * The step is tested against the **read's** aligned base rather than the
 * reference's, which is what makes the rewrite exact: the row still renders
 * base for base as it did, and the only thing that changes is the reference
 * position the bases are filed under. A step onto a deletion has no base to
 * swap with and stops.
 *
 * Being exact, it is also incomplete, and measurably so. An aligner does not
 * only choose among equivalent placements — it chooses the highest-scoring one,
 * which for a repeat allele carrying an interruption is often not equivalent to
 * any placement inside the array. FMR1's misplaced read is exactly that: 32bp
 * of the locus's own CGG anchored two bases early, starting on a `C` where the
 * read has a `G`, so no rewrite of it exists. Hence `reanchorInsertions` treats
 * this as the preferred spelling and not as the test of whether to move.
 */
export declare function shiftInsertion(read: ReadLayout, from: number, to: number, ins: string): string | undefined;
/** an array with the span of reference positions whose insertions it may claim */
interface FlankWindow {
    array: ReferenceArray;
    from: number;
    to: number;
}
/**
 * The window around each array that its insertions may be re-anchored from.
 *
 * Two arrays may not claim one position: `extractAllele` reads the slot at an
 * array's `end`, so a shared slot would be counted into two alleles. Neighbours
 * split the reference between them down the middle — a property of the
 * reference alone, so unlike the interval it replaces, no read can move it.
 */
export declare function flankWindows(arrays: ReferenceArray[]): FlankWindow[];
/**
 * Re-file each read's insertions under the array they belong to, one read at a
 * time.
 *
 * Measuring an allele over a reference interval fixes the "one array reports as
 * several sites" problem for indels the aligner placed *inside* the interval.
 * It does not fix the ones placed just outside: there the insertion is part of
 * no allele — it becomes its own run of insertion columns — and the read
 * carrying it is measured as though it had the reference allele. Both halves of
 * that are wrong, and neither is rare: at ATXN3 the aligner anchored 60 of 162
 * reads' expansions one base outside the array.
 *
 * Doing this per read is the whole point. Widening the shared interval instead
 * — which is what this replaces — made one read's misplacement everyone's: a
 * single spurious copy anchored two bases early moved the array's left edge for
 * every row, and the reference's own copy count with it. Re-anchoring touches
 * only the read that carries the insertion, so a read can be wrong on its own.
 *
 * Nothing here consults the other reads, or how many of them agree. A single
 * read's expansion is as real as fifty, which is what measuring over an
 * interval buys and what a vote would give back. What decides an insertion is
 * its own sequence: `unitIdentity` against the array's unit, since the aligner
 * is free to place a repeat allele outside the array but is not free to make
 * unrelated sequence out of the array's unit.
 */
export declare function reanchorInsertions(reads: ReadLayout[], arrays: ReferenceArray[]): ReadLayout[];
/**
 * Lay every row's allele out unit-per-block, one block per array.
 *
 * Arrays whose alleles are all one length still get a block: squaring the copies
 * up against each other is what turns "this row is 63 bases long" into "this row
 * has 21 copies and the 12th one differs", and that is true whether or not the
 * rows disagree.
 */
export declare function buildArrayBlocks(reads: ReadLayout[], arrays: ReferenceArray[]): ArrayBlock[];
export {};
