import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { WALK_BUDGETS } from '@jbrowse/graph-walks'

import {
  fileLocationSlot,
  tabixIndexSchema,
  walksLocations,
} from '../panSNTabix.ts'

import type { Instance } from '@jbrowse/mobx-state-tree'

/**
 * #config WalkTabixSyntenyAdapter
 * #trackType GraphTrack
 * #fileFormat synteny | Walk-indexed graph | Built by `gfa-to-tabix --walks`; haplotype lanes and local subgraphs from three tabix files
 * Serves a pangenome graph whose haplotype walks
 * [gfa-to-tabix](https://github.com/GMOD/gfa-to-tabix) `--walks` filed under
 * chunks of a reference, as haplotype-versus-reference alignments, the shape
 * `MultiWaySyntenyDisplay` draws as one lane per haplotype, and as the graph
 * display's cut. A window on the reference reads the walk rows filed under
 * it, and each haplotype is aligned to the reference, or to another
 * haplotype, on the nodes both walks visit. No base is compared, so a short
 * bubble with equal bases on both sides is written as mismatches and any other
 * as an insertion and a deletion.
 *
 * `walksUri` takes the prefix of one reference's walk file, `<prefix>.<sample>`,
 * and resolves `<walksUri>.walks.bed.gz` and its `.tbi`. The adapter reads walk
 * format 5, which gfa-to-tabix writes from 1.4, through @jbrowse/graph-walks.
 * Only a window on the anchor is answered.
 *
 * #example
 * ```js
 * {
 *   type: 'WalkTabixSyntenyAdapter',
 *   walksUri: 'https://jbrowse.org/demos/hprc/hprc-v2.1-mc-grch38-f5.GRCh38',
 *   assemblyNames: ['hg38'],
 *   assemblyNameToPanSN: { hg38: 'GRCh38' },
 * }
 * ```
 */

const WalkTabixSyntenyAdapter = ConfigurationSchema(
  'WalkTabixSyntenyAdapter',
  {
    /**
     * #slot
     * The first entry is the anchor: the JBrowse assembly the walk file's
     * reference sample is loaded as. A haplotype needs no entry: its lane
     * draws on the session assembly `assemblyNameToPanSN` maps to it, at
     * haplotype (`HG002#1`) or sample (`HG002`) depth, and a haplotype with no
     * assembly is still a lane, labelled by its PanSN prefix.
     */
    assemblyNames: {
      type: 'stringArray',
      defaultValue: [],
    },
    /**
     * #slot
     * a `gfa-to-tabix --walks` file in walk format 5
     */
    walksLocation: fileLocationSlot('/path/to/graph.walks.bed.gz'),
    /**
     * #slot
     */
    walksIndex: tabixIndexSchema('WalkTabixWalksIndex'),
    /**
     * #slot
     * the most haplotype steps one window keeps; a window whose walks hold
     * more shows a zoom-in notice instead, as does one whose rows hold eight
     * times as many. Counts only the haplotypes asked for. Walk rows draw
     * runs rather than steps and are bounded by `walkByteBudget` alone.
     */
    walkStepBudget: {
      type: 'integer',
      defaultValue: WALK_BUDGETS.stepBudget,
    },
    /**
     * #slot
     * the most compressed bytes one window fetches from the walk file, as its
     * Tabix index estimates it before any row is read; a window over it shows
     * a zoom-in notice instead.
     */
    walkByteBudget: {
      type: 'integer',
      defaultValue: WALK_BUDGETS.byteBudget,
    },
    /**
     * #slot
     * the haplotypes the graph display is cut for until the user picks
     * others, as PanSN prefixes (`HG002#1`, or `HG002` for both of its
     * haplotypes). Empty means the lanes the track's `assemblyNames` lists
     * after its reference, else every haplotype.
     */
    defaultHaplotypes: {
      type: 'stringArray',
      defaultValue: [],
    },
    /**
     * #slot
     * A tab-separated table of per-sample metadata, which the graph view's
     * walk rows group by. Its header row names the columns, and its first
     * column is the walk's sample (`HG00097`) or haplotype (`HG00097#1`).
     * Empty means no grouping.
     */
    samplesTsvLocation: fileLocationSlot(''),
    /**
     * #slot
     * Maps a JBrowse assembly name to its PanSN prefix in the graph, sample or
     * haplotype level (`{ hg38: 'GRCh38', 'HG002.1': 'HG002#1' }`). An
     * assembly not listed maps to itself.
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
     * preprocessor to allow the minimal config, for the GRCh38 set of a graph
     * built by `gfa-to-tabix --walks -o chr22`
     * ```json
     * {
     *   "type": "WalkTabixSyntenyAdapter",
     *   "walksUri": "chr22.GRCh38",
     *   "assemblyNames": ["hg38"],
     *   "assemblyNameToPanSN": { "hg38": "GRCh38" }
     * }
     * ```
     */
    preProcessSnapshot: walksLocations,
  },
)

export type WalkTabixSyntenyAdapterConfig = Instance<
  typeof WalkTabixSyntenyAdapter
>

export default WalkTabixSyntenyAdapter
