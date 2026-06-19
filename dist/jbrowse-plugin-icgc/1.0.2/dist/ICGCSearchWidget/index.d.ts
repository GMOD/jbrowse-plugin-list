/// <reference types="react" />
import PluginManager from '@jbrowse/core/PluginManager';
declare const _default: (jbrowse: PluginManager) => {
    configSchema: import("@jbrowse/core/configuration/configurationSchema").AnyConfigurationSchemaType;
    ReactComponent: ({ model }: {
        model: any;
    }) => JSX.Element;
    stateModel: import("mobx-state-tree").IModelType<{
        id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
        type: import("mobx-state-tree").ISimpleType<"ICGCSearchWidget">;
    }, {
        trackData: import("@jbrowse/core/util").FileLocation | undefined;
        indexTrackData: import("@jbrowse/core/util").FileLocation | undefined;
    } & {
        setTrackData(obj: import("@jbrowse/core/util").FileLocation): void;
        setIndexTrackData(obj: import("@jbrowse/core/util").FileLocation): void;
        clearData(): void;
    }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>;
    HeadingComponent: () => JSX.Element;
};
export default _default;
