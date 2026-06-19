/// <reference types="react" />
import PluginManager from '@jbrowse/core/PluginManager';
declare const _default: (pluginManager: PluginManager) => {
    configSchema: import("@jbrowse/core/configuration/configurationSchema").AnyConfigurationSchemaType;
    ReactComponent: ({ model }: {
        model: any;
    }) => JSX.Element;
    stateModel: import("mobx-state-tree").IModelType<{
        id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
        type: import("mobx-state-tree").ISimpleType<"ICGCFilterWidget">;
        target: import("mobx-state-tree").IMaybe<import("mobx-state-tree").IReferenceType<import("mobx-state-tree").IAnyType>>;
        filters: import("mobx-state-tree").IArrayType<import("mobx-state-tree").IModelType<{
            id: import("mobx-state-tree").ISimpleType<string>;
            category: import("mobx-state-tree").ISimpleType<string>;
            type: import("mobx-state-tree").ISimpleType<string>;
            filter: import("mobx-state-tree").ISimpleType<string>;
        }, {
            setCategory(newCategory: string): void;
            setFilter(newFilter: string): void;
            getFilter(): string;
        }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>>;
        colourBy: import("mobx-state-tree").IMapType<import("mobx-state-tree").IModelType<{
            id: import("mobx-state-tree").ISimpleType<string>;
            value: import("mobx-state-tree").ISimpleType<string>;
        }, {}, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>>;
    }, {
        setTarget(newTarget: any): void;
        addFilter(id: any, category: string, type: string, filter: string): void;
        deleteFilter(id: any): void;
        getFiltersByType(type: string): (import("mobx-state-tree").ModelInstanceTypeProps<{
            id: import("mobx-state-tree").ISimpleType<string>;
            category: import("mobx-state-tree").ISimpleType<string>;
            type: import("mobx-state-tree").ISimpleType<string>;
            filter: import("mobx-state-tree").ISimpleType<string>;
        }> & {
            setCategory(newCategory: string): void;
            setFilter(newFilter: string): void;
            getFilter(): string;
        } & import("mobx-state-tree").IStateTreeNode<import("mobx-state-tree").IModelType<{
            id: import("mobx-state-tree").ISimpleType<string>;
            category: import("mobx-state-tree").ISimpleType<string>;
            type: import("mobx-state-tree").ISimpleType<string>;
            filter: import("mobx-state-tree").ISimpleType<string>;
        }, {
            setCategory(newCategory: string): void;
            setFilter(newFilter: string): void;
            getFilter(): string;
        }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>>)[];
        clearFilters(): void;
    }, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>;
    HeadingComponent: () => JSX.Element;
};
export default _default;
