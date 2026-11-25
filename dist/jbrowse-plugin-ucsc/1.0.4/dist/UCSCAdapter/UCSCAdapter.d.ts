import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { Feature, Region } from '@jbrowse/core/util';
import type { Observable } from 'rxjs';
export default class UCSCAdapter extends BaseFeatureDataAdapter {
    private base;
    private genome;
    getRefNames(opts?: BaseOptions): Promise<string[] | never[]>;
    getFeatures(region: Region, opts?: BaseOptions): Observable<Feature>;
    freeResources(): void;
}
