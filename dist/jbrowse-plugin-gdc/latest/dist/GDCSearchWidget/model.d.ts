import type PluginManager from '@jbrowse/core/PluginManager';
import type { FileLocation } from '@jbrowse/core/util/types';
import type { Instance } from '@jbrowse/mobx-state-tree';
export default function f(_pluginManager: PluginManager): import("@jbrowse/mobx-state-tree").IModelType<{
    id: import("@jbrowse/mobx-state-tree").IOptionalIType<import("@jbrowse/mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("@jbrowse/mobx-state-tree").ISimpleType<"GDCSearchWidget">;
}, {
    trackData: FileLocation | undefined;
    indexTrackData: FileLocation | undefined;
} & {
    setTrackData(obj?: FileLocation): void;
    setIndexTrackData(obj?: FileLocation): void;
    clearData(): void;
}, import("@jbrowse/mobx-state-tree")._NotCustomized, import("@jbrowse/mobx-state-tree")._NotCustomized>;
export type GDCSearchStateModel = ReturnType<typeof f>;
export type GDCSearchModel = Instance<GDCSearchStateModel>;
