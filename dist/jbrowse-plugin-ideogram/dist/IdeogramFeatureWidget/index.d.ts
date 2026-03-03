/// <reference types="react" />
import PluginManager from '@jbrowse/core/PluginManager';
declare const _default: (pluginManager: PluginManager) => {
    configSchema: import("@jbrowse/core/configuration/configurationSchema").AnyConfigurationSchemaType;
    stateModel: import("mobx-state-tree").IModelType<{
        id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
        type: import("mobx-state-tree").ISimpleType<"IdeogramFeatureWidget">;
        featureData: import("mobx-state-tree").IType<{} | null | undefined, {}, {}>;
        view: import("mobx-state-tree").IMaybe<import("mobx-state-tree").IReferenceType<import("mobx-state-tree").IAnyType>>;
    }, {
        setFeatureData(data: any): void;
        clearFeatureData(): void;
        hasPlugin(name: string): boolean;
    }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>;
    ReactComponent: (props: any) => JSX.Element;
};
export default _default;
