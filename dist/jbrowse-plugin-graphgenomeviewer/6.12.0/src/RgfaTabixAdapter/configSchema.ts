import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { types } from '@jbrowse/mobx-state-tree'

import type { Instance } from '@jbrowse/mobx-state-tree'

/**
 * #config RgfaTabixAdapter
 * #trackType GraphTrack
 * #fileFormat graph | Indexed GFA | Built by `gfa-to-tabix`; serves segments as features and extracts local subgraphs
 * two tabix-indexed BED files, one of a graph's segments and one of its links,
 * written by [gfa-to-tabix](https://github.com/GMOD/gfa-to-tabix) from an rGFA
 * or from a plain GFA with paths. Both of its layouts are read: `anchored`,
 * where one query per file returns the graph under a region, and `contig`,
 * where the adapter follows links onto other contigs.
 *
 * The `uri` shorthand takes the prefix the build script was given and resolves
 * `<uri>.segs.bed.gz`, `<uri>.links.bed.gz` and their `.tbi` indexes. `coarse`
 * takes the same shorthand for a second pair at one node per bubble, built by
 * `build_bubble_tier.sh` in jbrowse-components, plus the zoom past which a
 * graph view following a linear view cuts it.
 *
 * `walksUri` takes the prefix of a walk-indexed file set in place of `uri`, and
 * resolves `<walksUri>.walks.bed.gz`, `<walksUri>.nodes.bed.gz`,
 * `<walksUri>.links.bed.gz` and their `.tbi` indexes. `gfa-to-tabix --walks -o
 * <prefix>` writes a set per reference sample from 0.5.0, so a track names one
 * as `<prefix>.<sample>`; a set from 0.4.0 holds every reference, and the track
 * names `<prefix>`. Such a graph's cut carries the haplotypes' walks, and
 * `defaultHaplotypes` names the ones it is cut for until the user picks others.
 *
 * #example
 * ```js
 * {
 *   type: 'RgfaTabixAdapter',
 *   uri: 'https://example.com/hprc.rgfa',
 *   coarse: { uri: 'https://example.com/hprc.tier10000', aboveBpPerPx: 1000 },
 * }
 * ```
 *
 * #example
 * ```js
 * {
 *   type: 'RgfaTabixAdapter',
 *   walksUri: 'https://jbrowse.org/demos/hprc/hprc-v2.1-mc-grch38.GRCh38',
 *   assemblyNameToPanSN: { hg38: 'GRCh38' },
 *   defaultHaplotypes: ['HG002', 'HG00733', 'HG02257', 'NA19240'],
 * }
 * ```
 */

function tbi(uri: string, baseUri: unknown, csi: unknown) {
  return {
    indexType: csi ? 'CSI' : 'TBI',
    location: { uri: `${uri}.${csi ? 'csi' : 'tbi'}`, baseUri },
  }
}

function prefixLocations(snap: Record<string, unknown>) {
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

function walksLocations(snap: Record<string, unknown>) {
  const { walksUri, baseUri, csi } = snap
  if (typeof walksUri !== 'string') {
    return snap
  }
  const file = (kind: string) => `${walksUri}.${kind}.bed.gz`
  return {
    ...snap,
    walksLocation: { uri: file('walks'), baseUri },
    walksIndex: tbi(file('walks'), baseUri, csi),
    segmentsLocation: { uri: file('nodes'), baseUri },
    segmentsIndex: tbi(file('nodes'), baseUri, csi),
    linksLocation: { uri: file('links'), baseUri },
    linksIndex: tbi(file('links'), baseUri, csi),
  }
}

export function normalizeSnapshot(snap: Record<string, unknown>) {
  const { coarse, baseUri, csi } = snap
  return walksLocations(
    prefixLocations(
      typeof coarse === 'object' && coarse !== null
        ? { ...snap, coarse: prefixLocations({ baseUri, csi, ...coarse }) }
        : snap,
    ),
  )
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

const RgfaTabixCoarseTier = ConfigurationSchema('RgfaTabixCoarseTier', {
  /**
   * #slot
   * The linear view's bp per px past which a graph following it cuts this
   * pair. Unset means the track has no coarse tier. There is no default,
   * because the zoom a fine cut stays drawable to depends on the graph's
   * density: a minigraph graph averages ~7 kb per segment, a base-level pggb
   * graph ~17 bp.
   */
  aboveBpPerPx: { type: 'maybeNumber' },
  /**
   * #slot
   */
  segmentsLocation: {
    type: 'fileLocation',
    defaultValue: {
      uri: '/path/to/graph.tier.segs.bed.gz',
      locationType: 'UriLocation',
    },
  },
  /**
   * #slot
   */
  segmentsIndex: indexSchema(
    'RgfaCoarseSegmentsIndex',
    '/path/to/graph.tier.segs.bed.gz.tbi',
  ),
  /**
   * #slot
   */
  linksLocation: {
    type: 'fileLocation',
    defaultValue: {
      uri: '/path/to/graph.tier.links.bed.gz',
      locationType: 'UriLocation',
    },
  },
  /**
   * #slot
   */
  linksIndex: indexSchema(
    'RgfaCoarseLinksIndex',
    '/path/to/graph.tier.links.bed.gz.tbi',
  ),
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
     * one row per haplotype path per reference chunk, its steps through that
     * chunk, written beside node and link files filed under the same chunks.
     * Unset means the graph has no walks.
     */
    walksLocation: {
      type: 'fileLocation',
      defaultValue: { uri: '', locationType: 'UriLocation' },
    },
    /**
     * #slot
     */
    walksIndex: indexSchema('RgfaWalksIndex', ''),
    /**
     * #slot
     * the reference chunk the walk file's rows are filed under, in bp, when
     * its header has no `chunk:i:` line to say so
     */
    walkChunk: {
      type: 'integer',
      defaultValue: 65536,
    },
    /**
     * #slot
     * the most haplotype steps a cut keeps; a window whose walks hold more
     * shows a zoom-in notice instead, as does one whose rows hold eight times
     * as many. Counts only the haplotypes the cut
     * is for, so fewer haplotypes draw a wider window.
     */
    walkStepBudget: {
      type: 'integer',
      defaultValue: 4_000_000,
    },
    /**
     * #slot
     * the most compressed bytes a cut of a walk-indexed graph fetches from its
     * three files, as their Tabix indexes estimate it before any row is read;
     * a window over it shows a zoom-in notice instead. On HPRC v2.1 chr22 a 1
     * Mb window fetches about 3 to 5 MB, and the dense 64 kb chunks at 11.80 to
     * 12.06 Mb on GRCh38 fetch 15 MB or more for a 10 kb window. The budget
     * covers every haplotype, since node and link rows are filed for all of
     * them.
     */
    walkByteBudget: {
      type: 'integer',
      defaultValue: 8_000_000,
    },
    /**
     * #slot
     * the haplotypes a walk-indexed graph is cut for until the user picks
     * others in the track's Haplotypes menu or Settings, as PanSN prefixes
     * (`HG002#1`, or `HG002` for both of its haplotypes). Empty means every
     * haplotype, or the lanes the track's `assemblyNames` lists after its
     * reference.
     */
    defaultHaplotypes: {
      type: 'stringArray',
      defaultValue: [],
    },
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
    /**
     * #slot
     * The same graph at one node per bubble, which a graph view following a
     * linear view cuts once that view is zoomed out past `aboveBpPerPx`, and
     * which no bp cap applies to. `{ uri, aboveBpPerPx }`, where `uri` is a
     * prefix as the adapter's own is.
     */
    coarse: RgfaTabixCoarseTier,
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
     * or, for the GRCh38 set of a graph built by `gfa-to-tabix --walks -o
     * chr22`,
     * ```json
     * { "type": "RgfaTabixAdapter", "walksUri": "chr22.GRCh38" }
     * ```
     */
    preProcessSnapshot: normalizeSnapshot,
  },
)

export type RgfaTabixAdapterConfig = Instance<typeof RgfaTabixAdapter>

export default RgfaTabixAdapter
