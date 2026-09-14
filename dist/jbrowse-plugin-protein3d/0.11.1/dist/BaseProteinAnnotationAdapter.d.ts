import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter';
import type { Feature, Region, SimpleFeatureSerialized } from '@jbrowse/core/util';
import type { Observable } from 'rxjs';
export interface ProteinAnnotationRow {
    [key: string]: unknown;
    uniqueId: string;
    start: number;
    end: number;
}
/**
 * Shared plumbing for the protein-annotation adapters (AlphaFold confidence,
 * AlphaMissense, UniProt variation). Each lives on the temporary protein
 * assembly, exposes no ref names, caches its parsed rows once, and emits the
 * rows that intersect a query region. Subclasses supply the parsing
 * (loadFeatures) and may decorate the emitted feature (featureData).
 */
export declare abstract class BaseProteinAnnotationAdapter<T extends ProteinAnnotationRow> extends BaseFeatureDataAdapter {
    static capabilities: string[];
    private feats;
    /** Parse the configured source into rows. */
    protected abstract loadFeatures(): Promise<T[]>;
    /** Fields for the emitted feature; override to add extras (e.g. `source`). */
    protected featureData(row: T, refName: string): SimpleFeatureSerialized;
    protected loadData(): Promise<T[]>;
    getRefNames(_opts?: BaseOptions): Promise<never[]>;
    getFeatures(query: Region, _opts?: BaseOptions): Observable<Feature>;
    freeResources(): void;
}
