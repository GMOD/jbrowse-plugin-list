import PluginManager from '@jbrowse/core/PluginManager';
import { FileLocation } from '@jbrowse/core/util/types';
import { Instance } from 'mobx-state-tree';
export default function f(pluginManager: PluginManager): import("mobx-state-tree").IModelType<{
    id: import("mobx-state-tree").IOptionalIType<import("mobx-state-tree").ISimpleType<string>, [undefined]>;
    type: import("mobx-state-tree").ISimpleType<"ICGCSearchWidget">;
}, {
    trackData: FileLocation | undefined;
    indexTrackData: FileLocation | undefined;
} & {
    setTrackData(obj: FileLocation): void;
    setIndexTrackData(obj: FileLocation): void;
    clearData(): void;
}, import("mobx-state-tree")._NotCustomized, import("mobx-state-tree")._NotCustomized>;
export declare type ImportPanelStateModel = ReturnType<typeof f>;
export declare type ImportPanelModel = Instance<ImportPanelStateModel>;
