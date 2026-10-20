import { max, min } from '@jbrowse/core/util';
import { openLocation } from '@jbrowse/core/util/io';
import { parseAlphaMissense } from './parseAlphaMissense';
import { BaseProteinAnnotationAdapter } from '../BaseProteinAnnotationAdapter';
export default class AlphaMissensePathogenicityAdapter extends BaseProteinAnnotationAdapter {
    async loadFeatures() {
        return parseAlphaMissense(await openLocation(this.getConf('location')).readFile('utf8'));
    }
    featureData(row, refName) {
        return { ...row, refName, source: row.variant };
    }
    async getGlobalStats(_opts) {
        const scores = (await this.loadData()).map(s => s.score);
        return { scoreMin: min(scores), scoreMax: max(scores) };
    }
    // always render bigwig instead of calculating a feature density for it
    async getMultiRegionFeatureDensityStats(_regions) {
        return { featureDensity: 0 };
    }
    async getSources() {
        const sources = new Set((await this.loadData()).map(f => f.variant));
        return [...sources].map(s => ({ name: s, __name: s }));
    }
}
