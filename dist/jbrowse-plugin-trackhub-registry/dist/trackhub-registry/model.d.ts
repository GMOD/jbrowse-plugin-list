import { AnyConfigurationModel } from '@jbrowse/core/configuration';
import PluginManager from '@jbrowse/core/PluginManager';
import { Instance } from 'mobx-state-tree';
export default function stateModelFactory(pluginManager: PluginManager): import("mobx-state-tree").IModelType<{
    name: import("mobx-state-tree").ISimpleType<string>;
    tracks: import("mobx-state-tree").IArrayType<import("mobx-state-tree").IAnyModelType>;
} & {
    type: import("mobx-state-tree").ISimpleType<"TheTrackHubRegistryConnection">;
    configuration: import("mobx-state-tree").ITypeUnion<any, any, any>;
}, {
    afterAttach(): void;
    addTrackConf(trackConf: {
        [x: string]: any;
    } & import("mobx-state-tree/dist/internal").NonEmptyObject & {
        setSubschema(slotName: string, data: unknown): any;
    } & import("mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>): any;
    addTrackConfs(trackConfs: ({
        [x: string]: any;
    } & import("mobx-state-tree/dist/internal").NonEmptyObject & {
        setSubschema(slotName: string, data: unknown): any;
    } & import("mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>)[]): any[];
    setTrackConfs(trackConfs: ({
        [x: string]: any;
    } & import("mobx-state-tree/dist/internal").NonEmptyObject & {
        setSubschema(slotName: string, data: unknown): any;
    } & import("mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>)[]): import("mobx-state-tree").IMSTArray<import("mobx-state-tree").IAnyModelType> & import("mobx-state-tree").IStateTreeNode<import("mobx-state-tree").IArrayType<import("mobx-state-tree").IAnyModelType>>;
    clear(): void;
} & {
    error: unknown;
} & {
    connect(connectionConf: AnyConfigurationModel): Promise<void>;
    setError(e: unknown): void;
}, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>;
export type TrackHubConnectionStateModel = ReturnType<typeof stateModelFactory>;
export type TrackHubConnectionModel = Instance<TrackHubConnectionStateModel>;
