import { type Instance } from '@jbrowse/mobx-state-tree';
export declare const TabularEditorStateModelType: import("@jbrowse/mobx-state-tree").IModelType<{
    isShown: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    featureCollapsed: import("@jbrowse/mobx-state-tree").IMapType<import("@jbrowse/mobx-state-tree").ISimpleType<boolean>>;
    filterText: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
}, {
    setFeatureCollapsed(id: string, state: boolean): void;
    setFilterText(text: string): void;
    clearFilterText(): void;
    collapseAllFeatures(): void;
    togglePane(): void;
    hidePane(): void;
    showPane(): void;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
export interface TabularEditorStateModel extends Instance<typeof TabularEditorStateModelType> {
}
//# sourceMappingURL=model.d.ts.map