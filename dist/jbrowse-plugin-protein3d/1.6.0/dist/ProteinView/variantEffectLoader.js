import { fetchVariantEffects } from './variantEffectSource';
/**
 * Builds the body of the autorun that fetches the values the view's
 * variant-effect scheme colours a structure by, once its UniProt entry is
 * known. An isoform model is numbered for the isoform while the sources
 * number the entry, so it asks nothing. An answer that arrives after the
 * scheme or entry changed, or after the structure left the view, is dropped.
 *
 * Leaving the variant-effect schemes forgets the answer, so choosing one again
 * asks again: a failure is retried then, and a success comes from the
 * source's cache. A failure is not retried while the scheme stays, since
 * recording it reruns this autorun.
 */
export function makeVariantEffectLoader(host, isAlive, fetchValues = fetchVariantEffects) {
    return function loadVariantEffects() {
        const scheme = host.variantEffectScheme;
        const { uniprotId, isoformAccession, isLoading } = host.uniProtEntry;
        const current = host.variantEffects;
        const accession = isoformAccession ? undefined : uniprotId;
        if (!scheme) {
            if (current) {
                host.setVariantEffects(undefined);
            }
            return;
        }
        if (isLoading ||
            (current?.scheme === scheme && current.accession === accession)) {
            return;
        }
        host.setVariantEffects({ scheme, accession });
        if (accession) {
            const answer = (result) => {
                if (isAlive() &&
                    host.variantEffects?.scheme === scheme &&
                    host.variantEffects.accession === accession) {
                    host.setVariantEffects({ scheme, ...result });
                }
            };
            fetchValues(scheme, accession).then(values => {
                answer({ accession, values });
            }, (error) => {
                answer({ accession, error });
            });
        }
    };
}
