import type { ReadLayout } from './readLayout';
import type { TviewPlan } from './tview';
import type { Feature } from '@jbrowse/core/util';
/**
 * The most probable call on each modified base, as parallel arrays rather than
 * one object per call to keep the worker's reply small: the row it is on, the
 * 1-based index into that row's ungapped letters, its type and its ML byte.
 */
export interface TviewModifications {
    rows: string[];
    /** the MM codes, `m`, `h`, `a` or a ChEBI number */
    types: string[];
    row: Uint32Array;
    residue: Uint32Array;
    type: Uint8Array;
    prob: Uint8Array;
    /** calls left out for being past the cap, the least probable first */
    dropped: number;
    /** rows with calls whose letters are not one run of the read's sequence */
    unplaced: number;
}
/**
 * Every call costs react-msaview on each load and each change of the row table,
 * with no spatial index to skip the ones off screen: over 916 rows that was
 * +90ms at 50k calls, +160ms at 100k and +415ms at 200k. A 20kb read carries
 * ~200 CpG calls at the genome's average density, so 50k is ~250 reads across
 * the widest window; 6mA called on every A does not fit.
 */
export declare const MAX_MODIFICATION_CALLS = 50000;
/**
 * The query index of a row's first letter, when its letters are one unbroken
 * run of the read's own sequence. They are, unless the layout moved bases of
 * the read past each other (an insertion re-filed into an array without an
 * exact rewrite) or left some out (an array block the row has no allele for),
 * and a call projected onto such a row would land on the wrong base.
 */
export declare function rowInRead(read: ReadLayout, row: string, layout: TviewPlan['layout']): {
    seq: string;
    first: number;
    length: number;
} | undefined;
interface ProjectArgs {
    features: Feature[];
    plan: TviewPlan;
    /** each read's rendered row, parallel to `plan.reads` */
    rows: string[];
    maxCalls?: number;
}
/**
 * Each modified base the rendered rows show, as an index into its row's
 * letters. Undefined when no read in the window has an MM tag, so a file
 * without modifications pays for one tag lookup per read.
 */
export declare function planModifications(args: ProjectArgs): {
    rows: string[];
    types: string[];
    row: Uint32Array<ArrayBuffer>;
    residue: Uint32Array<ArrayBuffer>;
    type: Uint8Array<ArrayBuffer>;
    prob: Uint8Array<ArrayBuffer>;
    dropped: number;
    unplaced: number;
} | undefined;
export {};
