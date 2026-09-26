import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { types } from '@jbrowse/mobx-state-tree'

import type { Instance } from '@jbrowse/mobx-state-tree'

/**
 * #config RgfaTabixAdapter
 * #trackType FeatureTrack
 * #fileFormat graph | Indexed rGFA | Built by `scripts/build_rgfa_tabix.sh`; serves segments as features and extracts local subgraphs
 * two tabix-indexed BED projections of an rGFA (minigraph). rGFA tags every
 * segment with `SN`/`SO`/`SR`, so both files record coordinates the graph
 * already states rather than inventing any. Plain GFA (pggb, odgi,
 * Minigraph-Cactus) has no such tags and is not supported.
 *
 * The `uri` shorthand takes the prefix the build script was given and resolves
 * `<uri>.segs.bed.gz`, `<uri>.links.bed.gz` and their `.tbi` indexes.
 *
 * #example
 * ```js
 * {
 *   type: 'RgfaTabixAdapter',
 *   uri: 'https://example.com/ecoli.rgfa',
 * }
 * ```
 */

function tbi(uri: string, baseUri: unknown, csi: unknown) {
  return {
    indexType: csi ? 'CSI' : 'TBI',
    location: { uri: `${uri}.${csi ? 'csi' : 'tbi'}`, baseUri },
  }
}

export function normalizeSnapshot(snap: Record<string, unknown>) {
  const { uri, baseUri, csi } = snap
  return typeof uri === 'string'
    ? {
        ...snap,
        segmentsLocation: { uri: `${uri}.segs.bed.gz`, baseUri },
        segmentsIndex: tbi(`${uri}.segs.bed.gz`, baseUri, csi),
        linksLocation: { uri: `${uri}.links.bed.gz`, baseUri },
        linksIndex: tbi(`${uri}.links.bed.gz`, baseUri, csi),
      }
    : snap
}

const indexSchema = (name: string, defaultUri: string) =>
  ConfigurationSchema(name, {
    /**
     * #slot
     */
    indexType: {
      model: types.enumeration('IndexType', ['TBI', 'CSI']),
      type: 'stringEnum',
      defaultValue: 'TBI',
    },
    /**
     * #slot
     */
    location: {
      type: 'fileLocation',
      defaultValue: { uri: defaultUri, locationType: 'UriLocation' },
    },
  })

const RgfaTabixAdapter = ConfigurationSchema(
  'RgfaTabixAdapter',
  {
    /**
     * #slot
     * one row per segment: `stableName start end segmentId rank`, as emitted by
     * `gfatools gfa2bed -m`
     */
    segmentsLocation: {
      type: 'fileLocation',
      defaultValue: {
        uri: '/path/to/graph.segs.bed.gz',
        locationType: 'UriLocation',
      },
    },
    /**
     * #slot
     */
    segmentsIndex: indexSchema(
      'RgfaSegmentsIndex',
      '/path/to/graph.segs.bed.gz.tbi',
    ),
    /**
     * #slot
     * one row per link per endpoint, each carrying both endpoints in full so a
     * neighbour on another stable sequence needs no segment-id lookup
     */
    linksLocation: {
      type: 'fileLocation',
      defaultValue: {
        uri: '/path/to/graph.links.bed.gz',
        locationType: 'UriLocation',
      },
    },
    /**
     * #slot
     */
    linksIndex: indexSchema(
      'RgfaLinksIndex',
      '/path/to/graph.links.bed.gz.tbi',
    ),
    /**
     * #slot
     * Maps a JBrowse assembly name to its PanSN sample prefix in the graph, for
     * when they differ. Defaults to identity: the assembly name is assumed to be
     * the PanSN sample name, and a graph whose stable names are bare (minigraph
     * writes `chr1`) needs nothing here at all.
     *
     * Minigraph-Cactus writes PanSN stable names, so HPRC's release-2 graph
     * calls the reference `GRCh38#0#chr1` and an `hg38` assembly needs
     * `{ hg38: 'GRCh38' }`. The prefix is what disambiguates: that same graph
     * also contains `CHM13#0#chr1`, so matching on the contig alone would
     * silently resolve to the wrong sample.
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
     * { "type": "RgfaTabixAdapter", "uri": "graph.rgfa" }
     * ```
     */
    preProcessSnapshot: normalizeSnapshot,
  },
)

export type RgfaTabixAdapterConfig = Instance<typeof RgfaTabixAdapter>

export default RgfaTabixAdapter
