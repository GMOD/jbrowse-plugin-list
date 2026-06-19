import PluginManager from '@jbrowse/core/PluginManager';
import { BaseSequenceAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { NoAssemblyRegion } from '@jbrowse/core/util/types';
import { Feature } from '@jbrowse/core/util/simpleFeature';
import { AnyConfigurationModel } from '@jbrowse/core/configuration/configurationSchema';
import { getSubAdapterType } from '@jbrowse/core/data_adapters/dataAdapterCache';
export declare const configSchema: import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaType<{
    /**
     * #slot
     */
    serverLocation: {
        type: string;
        description: string;
        defaultValue: {
            uri: string;
            locationType: string;
        };
    };
    sequenceIdType: {
        type: string;
        defaultValue: string;
        model: import("mobx-state-tree").ISimpleType<string>;
    };
    /**
     * #slot
     */
    sequenceData: {
        type: string;
        defaultValue: {};
        description: string;
    };
}, import("@jbrowse/core/configuration/configurationSchema").ConfigurationSchemaOptions<undefined, undefined>>;
interface SequenceObject {
    name: string;
    size: number;
}
export declare class AdapterClass extends BaseSequenceAdapter {
    protected sequenceData: Record<string, SequenceObject>;
    protected serverLocation: Promise<Record<string, number>>;
    constructor(config: AnyConfigurationModel, getSubAdapter?: getSubAdapterType, pluginManager?: PluginManager);
    getRefNames(): Promise<string[]>;
    getRegions(): Promise<NoAssemblyRegion[]>;
    /**
     * Fetch features for a certain region
     * @param param -
     * @returns Observable of Feature objects in the region
     */
    getFeatures({ refName, start, end }: NoAssemblyRegion): import("rxjs").Observable<Feature>;
    /**
     * called to provide a hint that data tied to a certain region
     * will not be needed for the foreseeable future and can be purged
     * from caches, etc
     */
    freeResources(): void;
}
export {};
