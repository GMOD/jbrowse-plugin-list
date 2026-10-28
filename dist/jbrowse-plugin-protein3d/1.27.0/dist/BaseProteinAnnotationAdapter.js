import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import { SimpleFeature, doesIntersect2 } from '@jbrowse/core/util';
import { ObservableCreate } from '@jbrowse/core/util/rxjs';
/**
 * Shared plumbing for the protein-annotation adapters (AlphaFold confidence,
 * AlphaMissense, UniProt variation). Each lives on the temporary protein
 * assembly, exposes no ref names, caches its parsed rows once, and emits the
 * rows that intersect a query region. Subclasses supply the parsing
 * (loadFeatures) and may decorate the emitted feature (featureData).
 */
export class BaseProteinAnnotationAdapter extends BaseFeatureDataAdapter {
    static capabilities = ['getFeatures', 'getRefNames'];
    feats;
    /** Fields for the emitted feature; override to add extras (e.g. `source`). */
    featureData(row, refName) {
        return { ...row, refName };
    }
    // Parse once and cache; a failed parse clears the cache so it can retry.
    loadData() {
        this.feats ??= this.loadFeatures().catch((e) => {
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
            for (const f of await this.loadData()) {
                if (doesIntersect2(f.start, f.end, start, end)) {
                    observer.next(new SimpleFeature(this.featureData(f, refName)));
                }
            }
            observer.complete();
        });
    }
    freeResources() { }
}
