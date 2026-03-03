import React from 'react';
import PluginManager from '@jbrowse/core/PluginManager';
declare const _default: (jbrowse: PluginManager) => {
    configSchema: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
    ReactComponent: ({ model }: {
        model: any;
    }) => React.JSX.Element;
    stateModel: import("mobx-state-tree").IModelType<{
        id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
        type: import("mobx-state-tree").ISimpleType<"GDCFilterWidget">;
        target: import("mobx-state-tree").IMaybe<import("mobx-state-tree").IReferenceType<any>>;
        filters: import("mobx-state-tree").IArrayType<import("mobx-state-tree").IModelType<{
            id: import("mobx-state-tree").ISimpleType<string>;
            category: import("mobx-state-tree").ISimpleType<string>;
            type: import("mobx-state-tree").ISimpleType<string>;
            filter: import("mobx-state-tree").ISimpleType<string>;
        }, {
            setCategory(newCategory: any): void;
            setFilter(newFilter: any): void;
        }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>>;
        colourBy: import("mobx-state-tree").IMapType<import("mobx-state-tree").IModelType<{
            id: import("mobx-state-tree").ISimpleType<string>;
            value: import("mobx-state-tree").ISimpleType<string>;
        }, {}, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>>;
    }, {
        setTarget(newTarget: any): void;
        addFilter(id: any, category: any, type: any, filter: any): void;
        deleteFilter(id: any): void;
        getFiltersByType(type: any): ({
            id: string;
            category: string;
            type: string;
            filter: string;
        } & import("mobx-state-tree/dist/internal").NonEmptyObject & {
            setCategory(newCategory: any): void;
            setFilter(newFilter: any): void;
        } & import("mobx-state-tree").IStateTreeNode<import("mobx-state-tree").IModelType<{
            id: import("mobx-state-tree").ISimpleType<string>;
            category: import("mobx-state-tree").ISimpleType<string>;
            type: import("mobx-state-tree").ISimpleType<string>;
            filter: import("mobx-state-tree").ISimpleType<string>;
        }, {
            setCategory(newCategory: any): void;
            setFilter(newFilter: any): void;
        }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>>)[];
        clearFilters(): void;
        setColourBy(newColourBy: any): void;
        getColourBy(): any;
    }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>;
    HeadingComponent: () => React.JSX.Element;
};
export default _default;
