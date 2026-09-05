import type { TviewPlanResult } from './TviewGetPlanRpc';
import type { AnyConfigurationModel } from '@jbrowse/core/configuration';
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
    adapterConfig: unknown;
    /** the label rows from this file carry; omitted when there is only one */
    sample?: string;
    trackId: string;
}
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
 * The assembly's own sequence adapter, which is what makes the reference a row
 * and, through it, makes an array an interval rather than an insertion. An
 * assembly that cannot supply one still works: the alignment is then reads only
 * and no array is reported, which is the pre-reference behaviour.
 */
export declare function sequenceAdapterConfig(session: AbstractSessionModel, assemblyName: string): Record<string, unknown> | undefined;
/**
 * One RPC per launch, however many files it draws from. The session id is
 * shared across the sources so the worker keeps one adapter cache for the view
 * rather than one per file.
 */
export declare function fetchTviewPlan({ session, sources, region, maxCells, }: {
    session: AbstractSessionModel;
    sources: TviewSource[];
    region: FetchRegion;
    maxCells?: number;
}): Promise<TviewPlanResult>;
