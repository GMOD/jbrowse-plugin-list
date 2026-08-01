import type { AnyConfigurationModel } from '@jbrowse/core/configuration';
import type { AbstractSessionModel, AbstractTrackModel } from '@jbrowse/core/util';
/** the RPC needs assemblyName to resolve refNameAliases for the file */
export interface FetchRegion {
    assemblyName: string;
    refName: string;
    start: number;
    end: number;
}
/** what CoreGetFeatures needs, reachable from a live track or from its config */
export interface TviewSource {
    adapterConfig: unknown;
    rpcSessionId: string;
}
export declare function sourceFromTrack(track: AbstractTrackModel): TviewSource;
/**
 * The trackId -> config index, whose shape has changed across hosts still in
 * the wild: v4.0.0 exposes a `tracksById` getter, v4.1-v4.3 a `getTracksById()`
 * method, and newer cores a per-id reactive `getTrackById(id)` (with
 * `getTracksById()` kept but deprecated). All three resolve connection and
 * assembly-sequence tracks; the `tracks` scan is a last resort because it does
 * not, and it subscribes the caller to every track.
 */
export interface SessionTrackLookup {
    tracks: AnyConfigurationModel[];
    getTrackById?: (id: string) => AnyConfigurationModel | undefined;
    getTracksById?: () => Record<string, AnyConfigurationModel>;
    tracksById?: Record<string, AnyConfigurationModel>;
}
export declare function findTrackConf(session: SessionTrackLookup, trackId: string): (import("@jbrowse/mobx-state-tree").ModelInstanceTypeProps<Record<string, any>> & {
    setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
        [x: string]: any;
    } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
        setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
            [x: string]: any;
        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & any & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
    } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
} & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>) | undefined;
/**
 * A rebuild runs from the track's config rather than a track model, so it works
 * whether or not the track is still open anywhere in the session.
 */
export declare function sourceFromConfig(conf: AnyConfigurationModel): TviewSource;
export declare function fetchTviewPlan({ session, source, region, }: {
    session: AbstractSessionModel;
    source: TviewSource;
    region: FetchRegion;
}): Promise<{
    plan: import("./tview").TviewPlan;
    rowCount: number;
}>;
