import { openLocation } from '@jbrowse/core/util/io';
import { BaseProteinAnnotationAdapter } from '../BaseProteinAnnotationAdapter';
/**
 * Converts UniProt variant features to plugin features. begin/end are 1-based
 * inclusive, converted here to a 0-based half-open interval [begin-1, end) so
 * variants line up with the interbase protein reference sequence.
 */
export function parseUniProtVariants(features, scoreField) {
    return features.map(({ begin, end, ...rest }, idx) => ({
        ...rest,
        uniqueId: `feat-${idx}`,
        start: +begin - 1,
        end: +end,
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
export default class UniProtVariationAdapter extends BaseProteinAnnotationAdapter {
    async loadFeatures() {
        const { features } = JSON.parse(await openLocation(this.getConf('location')).readFile('utf8'));
        return parseUniProtVariants(features, this.getConf('scoreField'));
    }
}
