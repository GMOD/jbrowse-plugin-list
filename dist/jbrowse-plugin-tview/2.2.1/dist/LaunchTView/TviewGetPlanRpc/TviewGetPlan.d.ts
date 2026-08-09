import { RpcMethodType } from '@jbrowse/core/pluggableElementTypes';
import type { Region } from '@jbrowse/core/util';
/** one BAM/CRAM to draw rows from, and the name its rows are grouped under */
export interface TviewSourceArgs {
    adapterConfig: Record<string, unknown>;
    sample?: string;
    /**
     * what this file calls the region's sequence. Filled in on the client, where
     * the assembly's aliases live: two files over one assembly routinely spell it
     * `4` and `chr4`, and a mismatched name fetches nothing and reports nothing.
     */
    refName?: string;
}
export interface TviewGetPlanArgs {
    sessionId: string;
    sources: TviewSourceArgs[];
    /** the assembly's sequence adapter, when it has one */
    sequenceAdapterConfig?: Record<string, unknown>;
    /** the sequence adapter's own spelling of the region */
    sequenceRefName?: string;
    region: Region;
    /** stop before rendering an alignment bigger than this many cells */
    maxCells: number;
}
/** what crosses back: the alignment, and the numbers the dialog reports */
export interface TviewArrayReport {
    start: number;
    end: number;
    period: number;
    unit: string;
    width: number;
    /** per row: copies carried, and allele length in bp */
    copies: [string, number][];
    lengths: [string, number][];
}
export interface TviewPlanResult {
    msa: string;
    /** Newick grouping rows by sample; absent unless several were loaded */
    tree?: string;
    rowCount: number;
    columnCount: number;
    cellCount: number;
    insertionWidths: [number, number][];
    arraySpans: [number, number, number][];
    region: {
        refName: string;
        start: number;
        end: number;
    };
    arrays: TviewArrayReport[];
    subjectIndex?: number;
    referenceName?: string;
    samples: string[];
    /** set when the alignment was over maxCells and `msa` is empty */
    tooLarge?: boolean;
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
export default class TviewGetPlan extends RpcMethodType {
    name: string;
    /**
     * Written against the 4.3.0 base class, which takes a bare
     * `Record<string, unknown>` and has no `renameRegions` helper — that is the
     * oldest host this bundle boots on, and the newer base class accepts the same
     * shape.
     */
    serializeArguments(args: Record<string, unknown>, rpcDriverClassName: string): Promise<Record<string, unknown>>;
    execute(args: TviewGetPlanArgs, rpcDriverClassName: string): Promise<{
        msa: string;
        tooLarge: boolean;
        rowCount: number;
        columnCount: number;
        cellCount: number;
        insertionWidths: [number, number][];
        arraySpans: [number, number, number][];
        region: {
            refName: string;
            start: number;
            end: number;
        };
        arrays: {
            start: number;
            end: number;
            period: number;
            unit: string;
            width: number;
            copies: [string, number][];
            lengths: [string, number][];
        }[];
        subjectIndex: number | undefined;
        referenceName: string | undefined;
        samples: string[];
    } | {
        msa: string;
        tree: string | undefined;
        rowCount: number;
        columnCount: number;
        cellCount: number;
        insertionWidths: [number, number][];
        arraySpans: [number, number, number][];
        region: {
            refName: string;
            start: number;
            end: number;
        };
        arrays: {
            start: number;
            end: number;
            period: number;
            unit: string;
            width: number;
            copies: [string, number][];
            lengths: [string, number][];
        }[];
        subjectIndex: number | undefined;
        referenceName: string | undefined;
        samples: string[];
    }>;
}
