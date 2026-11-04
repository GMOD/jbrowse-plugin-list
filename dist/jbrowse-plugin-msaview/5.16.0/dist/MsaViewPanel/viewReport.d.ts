import type { BlastParams, OrthologParams } from './model';
import type { MafRegion, MsaViewInitState } from './types';
interface ReportedView {
    blastParams: BlastParams | undefined;
    orthologParams: OrthologParams | undefined;
    init: MsaViewInitState | undefined;
    msaFilehandle: object | undefined;
    data: {
        msa?: string;
        tree?: string;
    };
    dataInitialized: boolean;
    launchCompleted: boolean;
    rid: string | undefined;
    rowMap: ReadonlyMap<string, string>;
    MSA: {
        getWidth: () => number;
    } | null;
    annotations: readonly unknown[];
    querySeqName: string;
    querySeqOffset: number;
    uniprotId: string | undefined;
    connectedViewId: string | undefined;
    connectedTranscript: string | undefined;
    connectedFeature: unknown;
    connectedView: object | undefined;
    mafRegion: MafRegion | undefined;
    transcriptMapping: {
        reason: string;
    } | {
        map: {
            refName: string;
        };
    } | undefined;
    connectionError: unknown;
    showLoading: boolean;
    error: unknown;
    notices: string[];
}
/**
 * What a view resolved to, as plain JSON: the header's facts, for a script or
 * an agent to read instead of the model's internals. docs/reading-the-view.md
 * describes each field.
 */
export declare function viewReport(view: ReportedView): {
    loading: boolean;
    error: string | undefined;
    notices: string[];
    source: {
        kind: string;
        database: "uniprotkb_swissprot" | "uniprotkb" | "pan_proteomes" | "uniprotkb_trembl" | "swissprot" | "uniprotrefprot" | "rp75" | "rp55" | "rp35" | "rp15";
        msaAlgorithm: "clustalo" | "muscle" | "kalign" | "mafft" | "browser" | undefined;
        maxHits: number | undefined;
        accession: string | undefined;
        queryLength: number | undefined;
        jobId: string | undefined;
        completed: boolean;
    } | {
        kind: string;
        orthologSource: "ncbi" | "panther" | "uniref";
        taxId: number;
        identity: import("../utils/unirefHomologs").UnirefIdentity | undefined;
        maxSpecies: number | undefined;
        taxa: number[] | undefined;
        geneCandidates: string[];
        msaAlgorithm: "clustalo" | "muscle" | "kalign" | "mafft" | "browser";
        queryLength: number | undefined;
        jobId: string | undefined;
        completed: boolean;
    } | {
        kind: string;
        url: string;
        uri?: undefined;
        name?: undefined;
        location?: undefined;
    } | {
        kind: string;
        uri: string;
        name: string | undefined;
        url?: undefined;
        location?: undefined;
    } | {
        kind: string;
        location: string | undefined;
        url?: undefined;
        uri?: undefined;
        name?: undefined;
    } | {
        kind: string;
        url?: undefined;
        uri?: undefined;
        name?: undefined;
        location?: undefined;
    };
    rows: number;
    columns: number;
    domainAnnotations: number;
    uniprotId: string | undefined;
    queryRow: {
        name: string;
        found: boolean;
        offset: number;
    };
    connection: {
        viewId: string | undefined;
        viewOpen: boolean;
        transcript: string | undefined;
        refName: string | undefined;
        mapped: boolean;
        unmappedBecause: string | undefined;
    } | undefined;
};
export {};
