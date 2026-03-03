import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { Region } from '@jbrowse/core/util/types';
import { Feature } from '@jbrowse/core/util/simpleFeature';
import { Instance } from 'mobx-state-tree';
import { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import MyConfigSchema from './configSchema';
export default class ICGCAdapter extends BaseFeatureDataAdapter {
    private filters;
    private size;
    private featureType;
    static capabilities: string[];
    constructor(config: Instance<typeof MyConfigSchema>);
    private featureCache;
    private fetchFeatures;
    getRefNames(): Promise<string[]>;
    private createQuery;
    getFeatures(region: Region, opts?: BaseOptions): import("rxjs").Observable<Feature>;
    freeResources(): void;
}
