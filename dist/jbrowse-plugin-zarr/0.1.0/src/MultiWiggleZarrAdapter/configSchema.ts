import { ConfigurationSchema } from '@jbrowse/core/configuration'

import type { Instance } from '@jbrowse/mobx-state-tree'

/**
 * #config MultiWiggleZarrAdapter
 * #trackType MultiQuantitativeTrack
 * #fileFormat quantitative | Zarr signal matrix
 * #gotcha The store is a directory, not a file: point `uri` at the `.zarr`
 * root (the level containing `zarr.json`), with no trailing slash and no
 * `/zarr.json` suffix.
 *
 * reads a samples-by-bins quantitative matrix from a Zarr v3 store, so a
 * multi-sample signal track costs a couple of chunk requests instead of one
 * indexed read per sample. Built by `the build_signal_zarr.ts converter`; the sample
 * list, bin size and resolution levels come from the store's own metadata, so
 * the config is just the location.
 *
 * #example
 * ```js
 * {
 *   type: 'MultiWiggleZarrAdapter',
 *   uri: 'https://example.com/cohort_cnv.zarr',
 * }
 * ```
 */

export function normalizeSnapshot(snap: Record<string, unknown>) {
  return snap.uri
    ? {
        ...snap,
        zarrLocation: {
          uri: snap.uri,
          baseUri: snap.baseUri,
        },
      }
    : snap
}

const MultiWiggleZarrAdapter = ConfigurationSchema(
  'MultiWiggleZarrAdapter',
  {
    /**
     * #slot
     */
    zarrLocation: {
      type: 'fileLocation',
      defaultValue: {
        uri: '/path/to/my.zarr',
        locationType: 'UriLocation',
      },
    },

    /**
     * #slot
     */
    resolutionMultiplier: {
      type: 'number',
      defaultValue: 1,
      description:
        'Resolution multiplier applied to level selection: <1 picks a finer pyramid level (more bins per screen), >1 a coarser one',
      advanced: true,
    },
  },
  {
    explicitlyTyped: true,

    /**
     * #preProcessSnapshot
     *
     *
     * preprocessor to allow minimal config:
     * ```json
     * {
     *   "type": "MultiWiggleZarrAdapter",
     *   "uri": "cohort_cnv.zarr"
     * }
     * ```
     */
    preProcessSnapshot: normalizeSnapshot,
  },
)

export type MultiWiggleZarrAdapterConfig = Instance<
  typeof MultiWiggleZarrAdapter
>

export default MultiWiggleZarrAdapter
