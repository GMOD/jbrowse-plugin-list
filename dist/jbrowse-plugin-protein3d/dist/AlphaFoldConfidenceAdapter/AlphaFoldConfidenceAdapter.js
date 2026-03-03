import { BaseFeatureDataAdapter, } from '@jbrowse/core/data_adapters/BaseAdapter';
import { SimpleFeature, doesIntersect2, } from '@jbrowse/core/util';
import { openLocation } from '@jbrowse/core/util/io';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
export default class AlphaFoldConfidenceAdapter extends BaseFeatureDataAdapter {
    static capabilities = ['getFeatures', 'getRefNames'];
    feats;
    async loadDataP() {
        const scores = JSON.parse(await openLocation(this.getConf('location')).readFile('utf8'));
        return scores.residueNumber.map((value, idx) => ({
            uniqueId: `feat-${idx}`,
            start: value,
            end: value + 1,
            score: scores.confidenceScore[idx],
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
//# sourceMappingURL=AlphaFoldConfidenceAdapter.js.map