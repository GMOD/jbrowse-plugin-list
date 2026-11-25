import type { AbstractSessionModel } from '@jbrowse/core/util';
/** the RPC needs assemblyName to resolve refNameAliases for the file */
export interface FetchRegion {
    assemblyName: string;
    refName: string;
    start: number;
    end: number;
}
/** one track's worth of rows, and the name they are grouped under */
export interface TviewSource {
    adapterConfig: Record<string, unknown>;
    sample: string;
    trackId: string;
}
/**
 * One RPC per launch, however many files it draws from. The session id is
 * shared across the sources so the worker keeps one adapter cache for the view
 * rather than one per file.
 */
export declare function fetchTviewPlan({ session, sources, region, maxCells, signal, }: {
    session: AbstractSessionModel;
    sources: TviewSource[];
    region: FetchRegion;
    maxCells?: number;
    signal?: AbortSignal;
}): Promise<import("./TviewGetPlanRpc").TviewPlanResult>;
