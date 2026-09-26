import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { types } from '@jbrowse/mobx-state-tree'

import type { Instance } from '@jbrowse/mobx-state-tree'

/**
 * #config MinigraphBubbleAdapter
 * #trackType FeatureTrack
 * #fileFormat graph | Minigraph bubble BED | `gfatools bubble` output; HPRC publishes one ready-made, so no preprocessing at all
 * the tabix-indexed BED `gfatools bubble` writes for a minigraph graph: one row
 * per bubble, on the reference's own coordinates. Unlike
 * [RgfaTabixAdapter](/docs/config/rgfatabixadapter) this needs no index build of
 * your own, because HPRC publishes this file beside its minigraph graph.
 *
 * It shows *where* the graph varies and by how much, not the graph itself.
 *
 * #example
 * ```js
 * {
 *   type: 'MinigraphBubbleAdapter',
 *   uri: 'https://jbrowse.org/demos/hprc/hprc-v2.0-mc-grch38.bubbles.bed.gz',
 *   assemblyNameToPanSN: { hg38: 'GRCh38' },
 * }
 * ```
 */

export function normalizeSnapshot(snap: Record<string, unknown>) {
  const { uri, baseUri, csi } = snap
  return typeof uri === 'string'
    ? {
        ...snap,
        bubblesLocation: { uri, baseUri },
        index: {
          indexType: csi ? 'CSI' : 'TBI',
          location: { uri: `${uri}.${csi ? 'csi' : 'tbi'}`, baseUri },
        },
      }
    : snap
}

const MinigraphBubbleAdapter = ConfigurationSchema(
  'MinigraphBubbleAdapter',
  {
    /**
     * #slot
     */
    bubblesLocation: {
      type: 'fileLocation',
      defaultValue: {
        uri: '/path/to/graph.bb.bed.gz',
        locationType: 'UriLocation',
      },
    },
    /**
     * #slot
     */
    index: ConfigurationSchema('MinigraphBubbleIndex', {
      /**
       * #slot index.indexType
       */
      indexType: {
        model: types.enumeration('IndexType', ['TBI', 'CSI']),
        type: 'stringEnum',
        defaultValue: 'TBI',
      },
      /**
       * #slot index.location
       */
      location: {
        type: 'fileLocation',
        defaultValue: {
          uri: '/path/to/graph.bb.bed.gz.tbi',
          locationType: 'UriLocation',
        },
      },
    }),
    /**
     * #slot
     * Maps a JBrowse assembly name to its PanSN sample prefix, for when they
     * differ. `gfatools bubble` names each row after the graph's stable
     * sequence, so a Minigraph-Cactus graph yields `GRCh38#0#chr6` and an
     * `hg38` assembly needs `{ hg38: 'GRCh38' }`; HPRC's published v1.0
     * minigraph bubbles are bare (`chr6`) and need nothing.
     */
    assemblyNameToPanSN: {
      type: 'frozen',
      defaultValue: {},
    },
  },
  {
    explicitlyTyped: true,

    /**
     * #preProcessSnapshot
     *
     * preprocessor to allow the minimal config
     * ```json
     * { "type": "MinigraphBubbleAdapter", "uri": "graph.bb.bed.gz" }
     * ```
     */
    preProcessSnapshot: normalizeSnapshot,
  },
)

export type MinigraphBubbleAdapterConfig = Instance<
  typeof MinigraphBubbleAdapter
>

export default MinigraphBubbleAdapter
