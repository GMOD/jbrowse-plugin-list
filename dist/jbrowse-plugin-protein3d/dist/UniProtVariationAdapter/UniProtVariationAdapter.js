import { BaseFeatureDataAdapter, } from '@jbrowse/core/data_adapters/BaseAdapter';
import { SimpleFeature, doesIntersect2, } from '@jbrowse/core/util';
import { openLocation } from '@jbrowse/core/util/io';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
export default class UniProtVariationAdapter extends BaseFeatureDataAdapter {
    static capabilities = ['getFeatures', 'getRefNames'];
    feats;
    async loadDataP() {
        const { features } = JSON.parse(await openLocation(this.getConf('location')).readFile('utf8'));
        const scoreField = this.getConf('scoreField');
        return features.map(({ begin, end, ...rest }, idx) => ({
            ...rest,
            uniqueId: `feat-${idx}`,
            start: +begin,
            end: +end + 1,
            score: scoreField === 'population_frequency'
                ? rest.populationFrequencies?.[0]?.frequency
                : scoreField === 'variant_impact_score'
                    ? rest.predictions?.[0]?.score
                    : undefined,
            description: rest.descriptions?.map(d => d.value).join(','),
            name: [
                rest.mutatedType
                    ? `${rest.wildType}->${rest.mutatedType}`
                    : `${rest.wildType}->del`,
            ],
        }));
    }
    async loadData(_opts = {}) {
        this.feats ??= this.loadDataP().catch((e) => {
            this.feats = undefined;
            throw e;
        });
        return this.feats;
    }
    async getRefNames(_opts = {}) {
        return [];
    }
    getFeatures(query, _opts = {}) {
        return ObservableCreate(async (observer) => {
            const { start, end, refName } = query;
            const data = await this.loadData();
            for (const f of data) {
                if (doesIntersect2(f.start, f.end, start, end)) {
                    observer.next(new SimpleFeature({ ...f, refName }));
                }
            }
            observer.complete();
        });
    }
    freeResources() { }
}
//# sourceMappingURL=UniProtVariationAdapter.js.map