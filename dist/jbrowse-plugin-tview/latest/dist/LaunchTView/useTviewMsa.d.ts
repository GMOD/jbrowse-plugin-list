import type { FetchRegion } from './fetchTviewPlan';
import type { AbstractTrackModel } from '@jbrowse/core/util';
export declare function useTviewMsa({ model, region, }: {
    model: AbstractTrackModel;
    region?: FetchRegion;
}): import("swr").SWRResponse<{
    plan: import("./tview").TviewPlan;
    rowCount: number;
}, any, {
    revalidateOnFocus: boolean;
    revalidateOnReconnect: boolean;
    revalidateIfStale: boolean;
    shouldRetryOnError: boolean;
}>;
