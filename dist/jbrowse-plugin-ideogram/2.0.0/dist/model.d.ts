import type PluginManager from '@jbrowse/core/PluginManager';
import type { MenuItem } from '@jbrowse/core/ui';
import type { FileLocation } from '@jbrowse/core/util/types';
import type { Instance } from '@jbrowse/mobx-state-tree';
/**
 * One pathway from Reactome's AnalysisService, narrowed to the fields the
 * pathways table and the hierarchy actually read.
 */
export interface ReactomePathway {
    stId: string;
    name: string;
    entities: {
        found: number;
        total: number;
        ratio: number;
        pValue: number;
        fdr: number;
    };
    reactions: {
        found: number;
        total: number;
        ratio: number;
    };
}
export default function IdeogramView(_pluginManager: PluginManager): import("@jbrowse/mobx-state-tree").IModelType<{
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"IdeogramView">;
    displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    sex: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
    orientation: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
    region: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
    assembly: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
    selectedAnnot: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
    ideogramId: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
    allRegions: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    showImportForm: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    showAnnotations: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    withReactome: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    showLoading: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    isAnalysisResults: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
    annotationsLocation: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").IType<any, any, any>, [undefined]>;
    pathways: import("@jbrowse/mobx-state-tree").IType<ReactomePathway[] | null | undefined, ReactomePathway[] | undefined, ReactomePathway[] | undefined>;
}, {
    widgetAnnotations: object | undefined;
    ideoAnnotations: object | undefined;
    highlightedAnnots: object[] | undefined;
} & {
    setWidth(_n: number): void;
    setDisplayName(str: string): void;
    setRegion(chr: string): void;
    setAssembly(asm: string): void;
    setAllRegions(toggle: boolean): void;
    setOrientation(ori: string): void;
    setShowImportForm(toggle: boolean): void;
    setAnnotationsLocation(loc: FileLocation): void;
    setWidgetAnnotations(obj: any): void;
    setIdeoAnnotations(obj: any): void;
    setWithReactome(toggle: boolean): void;
    setShowLoading(toggle: boolean): void;
    setPathways(obj: ReactomePathway[] | undefined): void;
    setIsAnalysisResults(toggle: boolean): void;
    setSelectedAnnot(item: string): void;
    setHighlightedAnnots(arr: any): void;
    setIdeogramId(id: string): void;
    applyHighlighting(): void;
    toggleAllRegions(toggle: boolean): void;
    toggleOrientation(): void;
    toggleSex(): void;
    toggleAnnotations(): void;
    refreshTable(): void;
} & {
    menuItems(): MenuItem[];
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
export type IdeogramViewStateModel = ReturnType<typeof IdeogramView>;
export interface IdeogramViewModel extends Instance<IdeogramViewStateModel> {
}
