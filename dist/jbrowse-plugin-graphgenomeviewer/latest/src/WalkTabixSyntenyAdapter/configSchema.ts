import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { types } from '@jbrowse/mobx-state-tree'

import type { Instance } from '@jbrowse/mobx-state-tree'

/**
 * #config WalkTabixSyntenyAdapter
 * #trackType GraphTrack
 * #fileFormat synteny | Walk-indexed graph | Built by `gfa-to-tabix --walks`; haplotype lanes and local subgraphs from three tabix files
 * Serves a pangenome graph whose haplotype walks
 * [gfa-to-tabix](https://github.com/GMOD/gfa-to-tabix) `--walks` filed under
 * chunks of a reference, as haplotype-versus-reference alignments, the shape
 * `MultiWaySyntenyDisplay` draws as one lane per haplotype, and as the graph
 * display's cut. A window on the reference reads the walks and nodes filed
 * under it, and each haplotype is aligned to the reference, or to another
 * haplotype, on the nodes both walks visit. No base is compared, so a short
 * bubble with equal bases on both sides is written as mismatches and any other
 * as an insertion and a deletion.
 *
 * `walksUri` takes the prefix of one reference's file set, `<prefix>.<sample>`
 * from gfa-to-tabix 0.5.0, and resolves `<walksUri>.walks.bed.gz`,
 * `<walksUri>.nodes.bed.gz`, `<walksUri>.links.bed.gz` and their `.tbi`
 * indexes. Only a window on the anchor is answered.
 *
 * #example
 * ```js
 * {
 *   type: 'WalkTabixSyntenyAdapter',
 *   walksUri: 'https://jbrowse.org/demos/hprc/hprc-v2.1-mc-grch38.GRCh38',
 *   assemblyNames: ['hg38'],
 *   assemblyNameToPanSN: { hg38: 'GRCh38' },
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
  const { walksUri, baseUri, csi } = snap
  if (typeof walksUri !== 'string') {
    return snap
  }
  const file = (kind: string) => `${walksUri}.${kind}.bed.gz`
  return {
    ...snap,
    walksLocation: { uri: file('walks'), baseUri },
    walksIndex: tbi(file('walks'), baseUri, csi),
    nodesLocation: { uri: file('nodes'), baseUri },
    nodesIndex: tbi(file('nodes'), baseUri, csi),
    linksLocation: { uri: file('links'), baseUri },
    linksIndex: tbi(file('links'), baseUri, csi),
  }
}

const indexSchema = (name: string) =>
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
      defaultValue: { uri: '', locationType: 'UriLocation' },
    },
  })

const location = (uri: string) => ({
  type: 'fileLocation' as const,
  defaultValue: { uri, locationType: 'UriLocation' },
})

const WalkTabixSyntenyAdapter = ConfigurationSchema(
  'WalkTabixSyntenyAdapter',
  {
    /**
     * #slot
     * The first entry is the anchor: the JBrowse assembly the file set's
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
     * one row per haplotype path per reference chunk, its steps through that
     * chunk
     */
    walksLocation: location('/path/to/graph.walks.bed.gz'),
    /**
     * #slot
     */
    walksIndex: indexSchema('WalkTabixWalksIndex'),
    /**
     * #slot
     * one row per node a chunk's walks visit, with its length and its place
     * on the reference
     */
    nodesLocation: location('/path/to/graph.nodes.bed.gz'),
    /**
     * #slot
     */
    nodesIndex: indexSchema('WalkTabixNodesIndex'),
    /**
     * #slot
     * one row per link between consecutive steps of a chunk's walks, which
     * only the graph display's cut reads
     */
    linksLocation: location('/path/to/graph.links.bed.gz'),
    /**
     * #slot
     */
    linksIndex: indexSchema('WalkTabixLinksIndex'),
    /**
     * #slot
     * the reference chunk the rows are filed under, in bp, when the walk
     * file's header has no `chunk:i:` line to say so
     */
    walkChunk: {
      type: 'integer',
      defaultValue: 65536,
    },
    /**
     * #slot
     * the most haplotype steps one window decodes; a window whose walk rows
     * hold more shows a zoom-in notice instead. Counts only the haplotypes
     * asked for.
     */
    walkStepBudget: {
      type: 'integer',
      defaultValue: 4_000_000,
    },
    /**
     * #slot
     * the most compressed bytes one window fetches, as the Tabix indexes
     * estimate it before any row is read; a window over it shows a zoom-in
     * notice instead. Lanes read the walk and node files, the graph display's
     * cut the link file too.
     */
    walkByteBudget: {
      type: 'integer',
      defaultValue: 8_000_000,
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
    samplesTsvLocation: location(''),
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
    preProcessSnapshot: normalizeSnapshot,
  },
)

export type WalkTabixSyntenyAdapterConfig = Instance<
  typeof WalkTabixSyntenyAdapter
>

export default WalkTabixSyntenyAdapter
