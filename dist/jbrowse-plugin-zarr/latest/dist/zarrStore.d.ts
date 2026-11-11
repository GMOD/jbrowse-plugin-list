import type PluginManager from '@jbrowse/core/PluginManager';
import type { FileLocation } from '@jbrowse/core/util/types';
import type { FetchStore } from 'zarrita';
export declare const zarritaP: Promise<typeof import("zarrita")>;
export declare function openZarrGroup({ adapterName, location, pluginManager, }: {
    adapterName: string;
    location: FileLocation;
    pluginManager: PluginManager | undefined;
}): Promise<import("zarrita").Group<FetchStore>>;
