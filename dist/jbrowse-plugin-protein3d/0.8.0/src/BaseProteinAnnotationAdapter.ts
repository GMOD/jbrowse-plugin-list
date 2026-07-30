import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter'
import { SimpleFeature, doesIntersect2 } from '@jbrowse/core/util'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'

import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter'
import type {
  Feature,
  Region,
  SimpleFeatureSerialized,
} from '@jbrowse/core/util'
import type { Observable } from 'rxjs'

// Index signature so a row spread into `{ ...row, refName }` satisfies
// SimpleFeatureSerialized (which carries arbitrary extra feature fields).
export interface ProteinAnnotationRow {
  [key: string]: unknown
  uniqueId: string
  start: number
  end: number
}

/**
 * Shared plumbing for the protein-annotation adapters (AlphaFold confidence,
 * AlphaMissense, UniProt variation). Each lives on the temporary protein
 * assembly, exposes no ref names, caches its parsed rows once, and emits the
 * rows that intersect a query region. Subclasses supply the parsing
 * (loadFeatures) and may decorate the emitted feature (featureData).
 */
export abstract class BaseProteinAnnotationAdapter<
  T extends ProteinAnnotationRow,
> extends BaseFeatureDataAdapter {
  public static capabilities = ['getFeatures', 'getRefNames']

  private feats: Promise<T[]> | undefined

  /** Parse the configured source into rows. */
  protected abstract loadFeatures(): Promise<T[]>

  /** Fields for the emitted feature; override to add extras (e.g. `source`). */
  protected featureData(row: T, refName: string): SimpleFeatureSerialized {
    return { ...row, refName }
  }

  // Parse once and cache; a failed parse clears the cache so it can retry.
  protected loadData() {
    this.feats ??= this.loadFeatures().catch((e: unknown) => {
      this.feats = undefined
      throw e
    })
    return this.feats
  }

  public async getRefNames(_opts: BaseOptions = {}) {
    return []
  }

  public getFeatures(query: Region, _opts: BaseOptions = {}): Observable<Feature> {
    return ObservableCreate<Feature>(async observer => {
      const { start, end, refName } = query
      for (const f of await this.loadData()) {
        if (doesIntersect2(f.start, f.end, start, end)) {
          observer.next(new SimpleFeature(this.featureData(f, refName)))
        }
      }
      observer.complete()
    })
  }

  public freeResources(): void {}
}
