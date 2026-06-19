import type PluginManager from '@jbrowse/core/PluginManager';
import type { AnyConfigurationModel } from '@jbrowse/core/configuration';
import type { Instance } from '@jbrowse/mobx-state-tree';
export default function stateModelFactory(pluginManager: PluginManager): import("@jbrowse/mobx-state-tree").IModelType<{
    name: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    tracks: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IAnyModelType>;
    configuration: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
        name: {
            type: string;
            defaultValue: string;
            description: string;
        };
        assemblyNames: {
            type: string;
            defaultValue: never[];
            description: string;
        };
    }, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "connectionId">>;
} & {
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"TheTrackHubRegistryConnection">;
    configuration: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
        trackDbId: {
            type: string;
            defaultValue: string;
            description: string;
        };
    }, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
        name: {
            type: string;
            defaultValue: string;
            description: string;
        };
        assemblyNames: {
            type: string;
            defaultValue: never[];
            description: string;
        };
    }, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, "connectionId">>, undefined>>;
}, {
    connect(_arg: AnyConfigurationModel): void;
} & {
    afterAttach(): void;
    addTrackConf(trackConf: Record<string, unknown> | ({
        [x: string]: any;
    } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
        setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
            [x: string]: any;
        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
            setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
                [x: string]: any;
            } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & any & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
    } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>)): any;
    addTrackConfs(trackConfs: (Record<string, unknown> | ({
        [x: string]: any;
    } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
        setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
            [x: string]: any;
        } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
            setSubschema(slotName: string, data: Record<string, unknown>): Record<string, unknown> | ({
                [x: string]: any;
            } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & any & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
        } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>);
    } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/core/configuration").AnyConfigurationSchemaType>))[]): void;
    setTrackConfs(trackConfs: AnyConfigurationModel[]): void;
    clear(): void;
} & {
    error: unknown;
} & {
    connect(connectionConf: AnyConfigurationModel): Promise<void>;
    setError(e: unknown): void;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
export type TrackHubConnectionStateModel = ReturnType<typeof stateModelFactory>;
export type TrackHubConnectionModel = Instance<TrackHubConnectionStateModel>;
