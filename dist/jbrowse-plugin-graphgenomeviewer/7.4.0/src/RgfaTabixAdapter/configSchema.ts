import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { WALK_BUDGETS } from '@jbrowse/graph-walks'

import {
  fileLocationSlot,
  tabixIndexSchema,
  tbiBeside,
  walksLocations,
} from '../panSNTabix.ts'

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
 * `gfa-to-tabix fold`, plus either the zoom past which a graph view following
 * a linear view cuts it (`aboveBpPerPx`) or the size it was folded at
 * (`foldBelowBp`), from which the plugin derives that zoom.
 *
 * `walksUri` takes the prefix of a walk file in place of `uri`, and resolves
 * `<walksUri>.walks.bed.gz` and its `.tbi`. `gfa-to-tabix --walks -o <prefix>`
 * writes one per reference sample, so a track names one as
 * `<prefix>.<sample>`. The adapter reads walk format 4, which gfa-to-tabix
 * writes from 1.2, through @jbrowse/graph-walks. Such a graph's cut carries
 * the haplotypes' walks, and `defaultHaplotypes` names the ones it is cut for
 * until the user picks others.
 *
 * #example
 * ```js
 * {
 *   type: 'RgfaTabixAdapter',
 *   uri: 'https://example.com/hprc.rgfa',
 *   coarse: { uri: 'https://example.com/hprc.fold10000', foldBelowBp: 10000 },
 * }
 * ```
 *
 * #example
 * ```js
 * {
 *   type: 'RgfaTabixAdapter',
 *   walksUri: 'https://jbrowse.org/demos/hprc/hprc-v2.1-mc-grch38-f5.GRCh38',
 *   assemblyNameToPanSN: { hg38: 'GRCh38' },
 *   defaultHaplotypes: ['HG002', 'HG00733', 'HG02257', 'NA19240'],
 * }
 * ```
 */

function prefixLocations(snap: Record<string, unknown>) {
  const { uri, baseUri, csi } = snap
  return typeof uri === 'string'
    ? {
        ...snap,
        segmentsLocation: { uri: `${uri}.segs.bed.gz`, baseUri },
        segmentsIndex: tbiBeside(`${uri}.segs.bed.gz`, baseUri, csi),
        linksLocation: { uri: `${uri}.links.bed.gz`, baseUri },
        linksIndex: tbiBeside(`${uri}.links.bed.gz`, baseUri, csi),
      }
    : snap
}

function normalizeSnapshot(snap: Record<string, unknown>) {
  const { coarse, baseUri, csi } = snap
  return walksLocations(
    prefixLocations(
      typeof coarse === 'object' && coarse !== null
        ? { ...snap, coarse: prefixLocations({ baseUri, csi, ...coarse }) }
        : snap,
    ),
  )
}

const RgfaTabixCoarseTier = ConfigurationSchema('RgfaTabixCoarseTier', {
  /**
   * #slot
   * The linear view's bp per px past which a graph following it cuts this
   * pair. Unset, with `foldBelowBp` unset too, means the track has no coarse
   * tier. There is no default,
   * because the zoom a fine cut stays drawable to depends on the graph's
   * density: a minigraph graph averages ~7 kb per segment, a base-level pggb
   * graph ~17 bp.
   */
  aboveBpPerPx: { type: 'maybeNumber' },
  /**
   * #slot
   * The size, in bp, this pair was folded at (`gfa-to-tabix fold --below`).
   * When `aboveBpPerPx` is unset, the handover is `foldBelowBp / 10`, the zoom
   * at which the fine cut folds the same variants away.
   */
  foldBelowBp: { type: 'maybeNumber' },
  /**
   * #slot
   */
  segmentsLocation: fileLocationSlot('/path/to/graph.tier.segs.bed.gz'),
  /**
   * #slot
   */
  segmentsIndex: tabixIndexSchema(
    'RgfaCoarseSegmentsIndex',
    '/path/to/graph.tier.segs.bed.gz.tbi',
  ),
  /**
   * #slot
   */
  linksLocation: fileLocationSlot('/path/to/graph.tier.links.bed.gz'),
  /**
   * #slot
   */
  linksIndex: tabixIndexSchema(
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
    segmentsLocation: fileLocationSlot('/path/to/graph.segs.bed.gz'),
    /**
     * #slot
     */
    segmentsIndex: tabixIndexSchema(
      'RgfaSegmentsIndex',
      '/path/to/graph.segs.bed.gz.tbi',
    ),
    /**
     * #slot
     * one row per link per endpoint, each carrying both endpoints in full so a
     * neighbour on another stable sequence needs no segment-id lookup
     */
    linksLocation: fileLocationSlot('/path/to/graph.links.bed.gz'),
    /**
     * #slot
     */
    linksIndex: tabixIndexSchema(
      'RgfaLinksIndex',
      '/path/to/graph.links.bed.gz.tbi',
    ),
    /**
     * #slot
     * a `gfa-to-tabix --walks` file in walk format 4: per reference chunk,
     * the reference's path, the ways haplotypes leave it and each haplotype's
     * piece. Unset means the graph has no walks.
     */
    walksLocation: fileLocationSlot(''),
    /**
     * #slot
     */
    walksIndex: tabixIndexSchema('RgfaWalksIndex'),
    /**
     * #slot
     * the most haplotype steps a cut keeps; a window whose walks hold more
     * shows a zoom-in notice instead, as does one whose rows hold eight times
     * as many. Counts only the haplotypes the cut is for, so fewer haplotypes
     * draw a wider window. Walk rows draw runs rather than steps and are
     * bounded by `walkByteBudget` alone.
     */
    walkStepBudget: {
      type: 'integer',
      defaultValue: WALK_BUDGETS.stepBudget,
    },
    /**
     * #slot
     * the most compressed bytes a cut of a walk-indexed graph fetches from its
     * walk file, as its Tabix index estimates it before any row is read; a
     * window over it shows a zoom-in notice instead. The budget covers every
     * haplotype, since a chunk's rows are filed for all of them.
     */
    walkByteBudget: {
      type: 'integer',
      defaultValue: WALK_BUDGETS.byteBudget,
    },
    /**
     * #slot
     * the haplotypes a walk-indexed graph is cut for until the user picks
     * others in the track's Haplotypes menu or Graph settings, as PanSN prefixes
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
     * which no bp cap applies to. `{ uri, aboveBpPerPx }` or `{ uri,
     * foldBelowBp }`, where `uri` is a prefix as the adapter's own is;
     * `aboveBpPerPx` wins when both are given.
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
