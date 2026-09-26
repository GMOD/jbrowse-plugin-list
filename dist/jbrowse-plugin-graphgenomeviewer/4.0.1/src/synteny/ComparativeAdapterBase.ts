import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter'
import { createStatusFanOut } from '@jbrowse/core/util'
import { from } from 'rxjs'
import { map, mergeMap, toArray } from 'rxjs/operators'

import { clipFeatureToRegion } from './clipFeatureToRegion.ts'

import type { AnyConfigurationModel } from '@jbrowse/core/configuration'
import type { Feature } from '@jbrowse/core/util'
import type { AugmentedRegion as Region } from '@jbrowse/core/util/types'
import type { ComparativeOptions } from '@jbrowse/synteny-core'

/** `keepAlignment` is core's, which synteny-core 5.0.0-beta.9 lacks */
export interface ClipOptions extends ComparativeOptions {
  keepAlignment?: boolean
}

/**
 * What every adapter in this plugin answers the same way.
 *
 * `hasDataForRefName` is true unconditionally because deciding it properly is a
 * `getFeatures` — and it has to be true, or BaseFeatureDataAdapter filters the
 * track out and `getFeatures` is never called at all. Eight adapters carried
 * that method and its three-line explanation verbatim.
 *
 * Only the answers that do not depend on config live here. Anything reading a
 * slot stays in the concrete adapter, for the reason `getAssemblyNamesFromConf`
 * documents: a base generic over the config cannot prove a slot name to
 * `getConf`, so hoisting a read costs the typing that makes it worth having.
 */
export abstract class ComparativeAdapterBase<
  CONF extends AnyConfigurationModel = AnyConfigurationModel,
> extends BaseFeatureDataAdapter<CONF> {
  public static capabilities = ['getFeatures', 'getRefNames']

  /**
   * Whether a record's two intervals are the aligned extents of one alignment,
   * which `clipToRegion` may cut at a region edge on both axes, or two genes,
   * whose extents are the genes and stay whole however the region falls.
   */
  protected readonly recordsAreAlignments: boolean = true

  async hasDataForRefName() {
    return true
  }

  /**
   * `clipToRegion`, `splitAtGapBp` and `keepAlignment` are honoured here and
   * nowhere below: `getFeatures` never sees them. A record on another assembly
   * than the region's, such as a lane pair read inside an anchor window, is in
   * no coordinates the region states, so it is split at its gaps and clipped
   * to its own extent.
   *
   * Emission is in region order, not arrival order, as core's base does: the
   * multi-way display's lane sort tie-breaks on first appearance in this list,
   * and its weights tie exactly, so arrival order would decide the stack.
   */
  getFeaturesInMultipleRegions(regions: Region[], opts: ClipOptions = {}) {
    const { clipToRegion, splitAtGapBp, keepAlignment, ...rest } = opts
    const clip = clipToRegion && this.recordsAreAlignments
    const slot = createStatusFanOut(rest.statusCallback)
    return from(regions).pipe(
      mergeMap((region, index) =>
        this.getFeatures(region, { ...rest, statusCallback: slot() }).pipe(
          mergeMap((feature): Feature[] =>
            clip
              ? clipFeatureToRegion(
                  feature,
                  feature.get('assemblyName') === region.assemblyName
                    ? region
                    : { start: feature.get('start'), end: feature.get('end') },
                  splitAtGapBp,
                  keepAlignment,
                )
              : [feature],
          ),
          toArray(),
          map(features => ({ index, features })),
        ),
      ),
      toArray(),
      mergeMap(chunks =>
        chunks
          .sort((a, b) => a.index - b.index)
          .flatMap(chunk => chunk.features),
      ),
    )
  }
}
