import React from 'react';
import type PluginManager from '@jbrowse/core/PluginManager';
declare const GDCSearchWidgetPlugin: (jbrowse: PluginManager) => {
    configSchema: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
    ReactComponent: ({ model }: {
        model: import("./model").GDCSearchModel;
    }) => React.JSX.Element;
    stateModel: import("@jbrowse/mobx-state-tree").IModelType<{
        id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
        type: import("@jbrowse/mobx-state-tree").ISimpleType<"GDCSearchWidget">;
    }, {
        trackData: import("@jbrowse/core/util").FileLocation | undefined;
        indexTrackData: import("@jbrowse/core/util").FileLocation | undefined;
    } & {
        setTrackData(obj?: import("@jbrowse/core/util").FileLocation): void;
        setIndexTrackData(obj?: import("@jbrowse/core/util").FileLocation): void;
        clearData(): void;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
    HeadingComponent: () => React.JSX.Element;
};
export default GDCSearchWidgetPlugin;
