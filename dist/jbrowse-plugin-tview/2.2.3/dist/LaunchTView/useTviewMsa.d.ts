import type { TviewInit } from '../TViewPanel/init';
import type { AbstractSessionModel } from '@jbrowse/core/util';
/**
 * A preview of what a `TviewInit` resolves to, for the dialog to report before
 * the view is opened.
 *
 * Resolved through the same two functions the view itself uses, so what the
 * dialog states and what the view then builds cannot disagree.
 */
export declare function useTviewMsa({ session, init, }: {
    session: AbstractSessionModel;
    init?: TviewInit;
}): import("swr").SWRResponse<import("./TviewGetPlanRpc").TviewPlanResult, any, {
    revalidateOnFocus: boolean;
    revalidateOnReconnect: boolean;
    revalidateIfStale: boolean;
    shouldRetryOnError: boolean;
}>;
