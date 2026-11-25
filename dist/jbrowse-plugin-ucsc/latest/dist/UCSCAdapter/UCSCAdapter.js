import { readConfObject } from '@jbrowse/core/configuration';
import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { SimpleFeature } from '@jbrowse/core/util';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
import { ucscFeatureData } from './ucscFeature';
class RegionTooLargeError extends Error {
    constructor() {
        super(...arguments);
        this.regionTooLarge = true;
    }
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
const chromosomeLists = new Map();
async function queryUcsc(base, endpoint, params, signal) {
    const search = new URLSearchParams(Object.entries(params).map(([key, value]) => [key, `${value}`]));
    const response = await fetch(`${base}${endpoint}?${search}`, { signal });
    const body = await response.json().catch(() => undefined);
    const error = isRecord(body) ? body.error : undefined;
    if (!response.ok || !isRecord(body) || error) {
        throw new Error(`UCSC API ${response.status}: ${typeof error === 'string' ? error : response.statusText}`);
    }
    return body;
}
function chromosomeList(base, genome) {
    const key = `${base} ${genome}`;
    const cached = chromosomeLists.get(key);
    const list = cached !== null && cached !== void 0 ? cached : queryUcsc(base, '/list/chromosomes', { genome }).then(body => (isRecord(body.chromosomes) ? Object.keys(body.chromosomes) : []), (error) => {
        chromosomeLists.delete(key);
        throw error;
    });
    chromosomeLists.set(key, list);
    return list;
}
export default class UCSCAdapter extends BaseFeatureDataAdapter {
    base() {
        const base = readConfObject(this.config, 'base');
        return isRecord(base) && typeof base.uri === 'string' ? base.uri : '';
    }
    genome(assemblyName = '') {
        const genome = readConfObject(this.config, 'genome');
        return typeof genome === 'string' && genome ? genome : assemblyName;
    }
    async getRefNames(opts = {}) {
        const genome = this.genome(opts.assemblyName);
        return genome ? chromosomeList(this.base(), genome) : [];
    }
    getFeatures(region, opts = {}) {
        return ObservableCreate(async (observer) => {
            const track = `${readConfObject(this.config, 'track')}`;
            const maxItems = Number(readConfObject(this.config, 'maxItems'));
            const body = await queryUcsc(this.base(), '/getData/track', {
                genome: this.genome(region.assemblyName),
                track,
                chrom: region.refName,
                start: Math.max(0, Math.floor(region.start)),
                end: Math.ceil(region.end),
                maxItemsOutput: maxItems,
            }, opts.signal);
            if (body.maxItemsLimit === true) {
                throw new RegionTooLargeError(`More than ${maxItems} features from UCSC track ${track} here; zoom in to see them`);
            }
            const records = body[track];
            if (!Array.isArray(records)) {
                throw new Error(`UCSC returned no feature list for ${track} (track type ${String(body.trackType)})`);
            }
            const trackType = typeof body.trackType === 'string' ? body.trackType : '';
            for (const record of records) {
                if (isRecord(record)) {
                    observer.next(new SimpleFeature({
                        id: `${track}-${JSON.stringify(record)}`,
                        data: ucscFeatureData(record, trackType, region.refName),
                    }));
                }
            }
            observer.complete();
        }, opts.signal);
    }
    freeResources() { }
}
//# sourceMappingURL=UCSCAdapter.js.map