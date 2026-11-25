import { RpcMethodType } from '@jbrowse/core/pluggableElementTypes';
import type { TviewModifications } from '../modifications';
import type { RpcCallContext, RpcExecuteArgs } from '@jbrowse/core/rpc/RpcRegistry';
import type { Region } from '@jbrowse/core/util';
import type { Highlight, RowDataInput } from 'react-msaview';
/** one BAM/CRAM to draw rows from, and the name its rows are grouped under */
export interface TviewSourceArgs {
    adapterConfig: Record<string, unknown>;
    sample: string;
    /**
     * what this file calls the region's sequence. Filled in on the client, where
     * the assembly's aliases live: two files over one assembly routinely spell it
     * `4` and `chr4`, and a mismatched name fetches nothing and reports nothing.
     */
    refName?: string;
}
export interface TviewGetPlanArgs {
    sources: TviewSourceArgs[];
    /** names the genome, so the call layer attaches its sequence adapter */
    assemblyName: string;
    /** the sequence adapter's own spelling of the region */
    sequenceRefName: string;
    region: Region;
    /** stop before rendering an alignment bigger than this many cells */
    maxCells: number;
}
export interface TviewPlanResult {
    msa: string;
    /** per row name: its sample, and its copies and allele length at the subject */
    rowData: RowDataInput;
    /** a bracket over each insertion site and each array block */
    highlights: Highlight[];
    columnCount: number;
    cellCount: number;
    region: {
        refName: string;
        start: number;
        end: number;
    };
    /** whether rows carry a copy count at a subject array */
    hasSubject: boolean;
    samples: string[];
    /** set when the alignment was over maxCells and `msa` is empty */
    tooLarge?: boolean;
    /** set when some read in the window has an MM tag */
    modifications?: TviewModifications;
}
declare module '@jbrowse/core/rpc/RpcRegistry' {
    interface RpcRegistry {
        TviewGetPlan: {
            args: TviewGetPlanArgs;
            return: TviewPlanResult;
        };
    }
}
/**
 * Builds the whole alignment in the worker and sends back the FASTA.
 *
 * The work this moves is not the fetch — `CoreGetFeatures` already ran in a
 * worker — but everything after it. Fetching from the client meant serializing
 * every read's sequence and CIGAR across the boundary and then running the
 * pairwise alignments and the string building on the main thread, where a
 * region carrying a kilobase-scale array froze the UI for as long as it took.
 * What comes back now is the alignment, which is smaller than the reads it was
 * built from and is the only thing the view has a use for.
 *
 * It is also what makes several files one call: their rows are squared up
 * against the same reference interval, so an array's copies are counted once,
 * over rows from all of them.
 */
export default class TviewGetPlan extends RpcMethodType<'TviewGetPlan'> {
    name: "TviewGetPlan";
    serializeArguments(args: TviewGetPlanArgs & RpcCallContext): Promise<Record<string, unknown>>;
    execute(args: RpcExecuteArgs<'TviewGetPlan'>): Promise<{
        modifications?: {
            rows: string[];
            types: string[];
            row: Uint32Array<ArrayBuffer>;
            residue: Uint32Array<ArrayBuffer>;
            type: Uint8Array<ArrayBuffer>;
            prob: Uint8Array<ArrayBuffer>;
            dropped: number;
            unplaced: number;
        } | undefined;
        msa: string;
        columnCount: number;
        cellCount: number;
        rowData: RowDataInput;
        highlights: Highlight[];
        region: {
            refName: string;
            start: number;
            end: number;
        };
        hasSubject: boolean;
        samples: string[];
    } | {
        msa: string;
        tooLarge: boolean;
        columnCount: number;
        cellCount: number;
        rowData: RowDataInput;
        highlights: Highlight[];
        region: {
            refName: string;
            start: number;
            end: number;
        };
        hasSubject: boolean;
        samples: string[];
    }>;
}
