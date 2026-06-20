import type PluginManager from '@jbrowse/core/PluginManager';
import type { IAnyStateTreeNode } from '@jbrowse/mobx-state-tree';
export default function f(jbrowse: PluginManager): import("@jbrowse/mobx-state-tree").IModelType<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"GDCFilterWidget">;
    target: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").IReferenceType<import("@jbrowse/mobx-state-tree").IAnyModelType>>;
    filters: import("@jbrowse/mobx-state-tree").IArrayType<import("@jbrowse/mobx-state-tree").IModelType<{
        id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        category: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        filter: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {
        setCategory(newCategory: string): void;
        setFilter(newFilter: string): void;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
    colourBy: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").IModelType<{
        id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        value: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>;
}, {
    setTarget(newTarget: IAnyStateTreeNode): void;
    addFilter(id: string, category: string, type: string, filter: string): void;
    deleteFilter(id: string): void;
    getFiltersByType(type: string): ({
        id: string;
        category: string;
        type: string;
        filter: string;
    } & import("@jbrowse/mobx-state-tree/dist/internal").NonEmptyObject & {
        setCategory(newCategory: string): void;
        setFilter(newFilter: string): void;
    } & import("@jbrowse/mobx-state-tree").IStateTreeNode<import("@jbrowse/mobx-state-tree").IModelType<{
        id: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        category: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        type: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
        filter: import("@jbrowse/mobx-state-tree").ISimpleType<string>;
    }, {
        setCategory(newCategory: string): void;
        setFilter(newFilter: string): void;
    }, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>>)[];
    clearFilters(): void;
    setColourBy(newColourBy: unknown): void;
    getColourBy(): {};
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
