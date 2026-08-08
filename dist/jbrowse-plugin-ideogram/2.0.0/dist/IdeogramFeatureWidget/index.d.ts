import type PluginManager from '@jbrowse/core/PluginManager';
declare const _default: (pluginManager: PluginManager) => {
    configSchema: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
    stateModel: import("@jbrowse/mobx-state-tree").IModelType<{
        id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
        type: import("@jbrowse/mobx-state-tree").ISimpleType<"IdeogramFeatureWidget">;
        featureData: import("@jbrowse/mobx-state-tree").IType<{} | null | undefined, {}, {}>;
        view: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IReferenceType<import("@jbrowse/mobx-state-tree").IAnyType>>;
    }, {
        setFeatureData(data: any): void;
        clearFeatureData(): void;
        hasPlugin(name: string): boolean;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
    ReactComponent: (props: any) => import("react").JSX.Element;
};
export default _default;
