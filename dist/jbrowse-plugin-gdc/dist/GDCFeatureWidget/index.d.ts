import PluginManager from '@jbrowse/core/PluginManager';
export declare const configSchema: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
export declare function stateModelFactory(_pluginManager: PluginManager): import("mobx-state-tree").IModelType<{
    id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("mobx-state-tree").ISimpleType<"GDCFeatureWidget">;
    featureData: import("mobx-state-tree").IType<{} | null | undefined, {}, {}>;
}, {
    setFeatureData(data: any): void;
    clearFeatureData(): void;
}, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>;
