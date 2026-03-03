import React from 'react';
import PluginManager from '@jbrowse/core/PluginManager';
declare const _default: (jbrowse: PluginManager) => {
    configSchema: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
    ReactComponent: ({ model }: {
        model: {
            id: string;
            type: "GDCSearchWidget";
        } & import("mobx-state-tree/dist/internal").NonEmptyObject & {
            trackData: import("@jbrowse/core/util").FileLocation | undefined;
            indexTrackData: import("@jbrowse/core/util").FileLocation | undefined;
        } & {
            setTrackData(obj?: import("@jbrowse/core/util").FileLocation | undefined): void;
            setIndexTrackData(obj?: import("@jbrowse/core/util").FileLocation | undefined): void;
            clearData(): void;
        } & import("mobx-state-tree").IStateTreeNode<import("mobx-state-tree").IModelType<{
            id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
            type: import("mobx-state-tree").ISimpleType<"GDCSearchWidget">;
        }, {
            trackData: import("@jbrowse/core/util").FileLocation | undefined;
            indexTrackData: import("@jbrowse/core/util").FileLocation | undefined;
        } & {
            setTrackData(obj?: import("@jbrowse/core/util").FileLocation | undefined): void;
            setIndexTrackData(obj?: import("@jbrowse/core/util").FileLocation | undefined): void;
            clearData(): void;
        }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>>;
    }) => React.JSX.Element;
    stateModel: import("mobx-state-tree").IModelType<{
        id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
        type: import("mobx-state-tree").ISimpleType<"GDCSearchWidget">;
    }, {
        trackData: import("@jbrowse/core/util").FileLocation | undefined;
        indexTrackData: import("@jbrowse/core/util").FileLocation | undefined;
    } & {
        setTrackData(obj?: import("@jbrowse/core/util").FileLocation | undefined): void;
        setIndexTrackData(obj?: import("@jbrowse/core/util").FileLocation | undefined): void;
        clearData(): void;
    }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>;
    HeadingComponent: () => React.JSX.Element;
};
export default _default;
