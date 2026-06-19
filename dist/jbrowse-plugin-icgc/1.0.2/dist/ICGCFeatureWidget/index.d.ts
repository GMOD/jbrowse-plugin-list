import PluginManager from '@jbrowse/core/PluginManager';
export declare const configSchema: import("@jbrowse/core/configuration/configurationSchema").AnyConfigurationSchemaType;
export declare function stateModelFactory(pluginManager: PluginManager): import("mobx-state-tree").IModelType<{
    id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("mobx-state-tree").ISimpleType<"ICGCFeatureWidget">;
    featureData: import("mobx-state-tree").IType<{} | null | undefined, {}, {}>;
    view: import("mobx-state-tree").IMaybe<import("mobx-state-tree").IReferenceType<import("mobx-state-tree").IAnyType>>;
}, {
    setFeatureData(data: any): void;
    clearFeatureData(): void;
}, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>;
