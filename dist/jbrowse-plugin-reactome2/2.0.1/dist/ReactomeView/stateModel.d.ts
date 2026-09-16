import type { Pathway } from './reactomeApi';
import type { Instance } from '@jbrowse/mobx-state-tree';
declare const stateModel: import("@jbrowse/mobx-state-tree").IModelType<Omit<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    minimized: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
}, "type" | "selectedPathway" | "gene" | "message"> & {
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"ReactomeView">;
    selectedPathway: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    gene: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    message: import("@jbrowse/mobx-state-tree").IType<string | undefined, string, string>;
}, {
    width: number;
} & {
    menuItems(): import("@jbrowse/core/ui").MenuItem[];
} & {
    setDisplayName(name: string): void;
    setWidth(newWidth: number): void;
    setMinimized(flag: boolean): void;
} & {
    pathways: Pathway[] | undefined;
} & {
    setMessage(message: string): void;
    setSearchResult(gene: string, pathways: Pathway[]): void;
    selectPathway({ stId, name }: Pathway): void;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree").ModelSnapshotType<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    displayName: import("@jbrowse/mobx-state-tree").IMaybe<import("@jbrowse/mobx-state-tree").ISimpleType<string>>;
    minimized: import("@jbrowse/mobx-state-tree").IType<boolean | undefined, boolean, boolean>;
}> & import("@jbrowse/mobx-state-tree")._NotCustomized>;
export type ReactomeViewModel = Instance<typeof stateModel>;
export default stateModel;
