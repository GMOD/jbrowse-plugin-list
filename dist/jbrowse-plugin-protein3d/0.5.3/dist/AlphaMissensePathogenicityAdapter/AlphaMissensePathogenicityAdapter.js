import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { SimpleFeature, doesIntersect2, max, min } from '@jbrowse/core/util';
import { openLocation } from '@jbrowse/core/util/io';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
/**
 * Parses AlphaMissense CSV text (protein_variant,score,am_class). The
 * protein_variant column looks like "V123L": a ref AA, a 1-based residue
 * coordinate, and a variant AA. Rows that don't parse to a numeric coordinate
 * are skipped rather than emitted as bogus position-0 features.
 */
export function parseAlphaMissense(text) {
    return text
        .split('\n')
        .slice(1)
        .map(f => f.trim())
        .filter(f => !!f)
        .flatMap((row, idx) => {
        const [protein_variant = '', score, am_class] = row.split(',');
        const ref = protein_variant[0];
        const variant = protein_variant.at(-1);
        const coord = +protein_variant.slice(1, -1);
        return ref !== undefined &&
            variant !== undefined &&
            !Number.isNaN(coord) &&
            score !== undefined &&
            am_class !== undefined
            ? [
                {
                    uniqueId: `feat-${idx}`,
                    ref,
                    variant,
                    start: coord,
                    end: coord + 1,
                    score: +score,
                    am_class,
                },
            ]
            : [];
    });
}
export default class AlphaMissensePathogenicityAdapter extends BaseFeatureDataAdapter {
    static capabilities = ['getFeatures', 'getRefNames'];
    feats;
    async loadDataP() {
        const scores = await openLocation(this.getConf('location')).readFile('utf8');
        return parseAlphaMissense(scores);
    }
    async loadData(_opts = {}) {
        this.feats ??= this.loadDataP().catch((e) => {
            this.feats = undefined;
            throw e;
        });
        return this.feats;
    }
    async getGlobalStats(_opts) {
        const data = await this.loadData();
        const scores = data.map(s => s.score);
        return { scoreMin: min(scores), scoreMax: max(scores) };
    }
    // always render bigwig instead of calculating a feature density for it
    async getMultiRegionFeatureDensityStats(_regions) {
        return { featureDensity: 0 };
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
                    observer.next(new SimpleFeature({
                        ...f,
                        refName,
                        source: f.variant,
                    }));
                }
            }
            observer.complete();
        });
    }
    async getSources() {
        const sources = new Set();
        const data = await this.loadData();
        for (const f of data) {
            sources.add(f.variant);
        }
        return [...sources].map(s => ({
            name: s,
            __name: s,
        }));
    }
    freeResources() { }
}
