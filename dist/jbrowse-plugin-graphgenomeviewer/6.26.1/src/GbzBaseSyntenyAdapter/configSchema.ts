import { GBZ_CUT_DEFAULTS } from '@jbrowse/bandage-core/gbzWindow'
import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { types } from '@jbrowse/mobx-state-tree'

import { splitUri } from '../locationName'

import type { Instance } from '@jbrowse/mobx-state-tree'

/**
 * #config GbzBaseSyntenyAdapter
 * #trackType GraphTrack
 * #fileFormat synteny | gbz-base pangenome database | Haplotype alignments read from the graph at query time, no PAF conversion
 * Serves a pangenome graph stored as a gbz-base SQLite database (`.gbz.db`) as
 * haplotype-versus-reference alignments, the shape `MultiWaySyntenyDisplay`
 * draws as one lane per haplotype. A window on the reference is located on the
 * graph's reference path, every haplotype's walk through the nodes it covers
 * is recovered and named, and each haplotype becomes one alignment record with
 * a CIGAR, so the graph is read through HTTP range requests with no offline
 * conversion. Naming the walks takes the companion haplotype index that
 * `gbz-haplotype-index` writes; without it the graph cannot say which
 * haplotype a walk belongs to.
 *
 * Only the fine tier exists: a whole-chromosome view stays on a PIF's coarse
 * tier. A query on a haplotype lane answers nothing, so the multi-way display
 * composes its lane-to-lane links through the reference.
 *
 * #example
 * ```js
 * {
 *   type: 'GbzBaseSyntenyAdapter',
 *   uri: 'hprc-v2.gbz.db',
 *   assemblyNames: ['hg38'],
 *   assemblyNameToPanSN: { hg38: 'GRCh38#0' },
 * }
 * ```
 */
const GbzBaseSyntenyAdapter = ConfigurationSchema(
  'GbzBaseSyntenyAdapter',
  {
    /**
     * #slot
     * The first entry is the anchor: the JBrowse assembly the graph's reference
     * sample is loaded as. A haplotype needs no entry: its lane draws on the
     * session assembly named or aliased by its PanSN prefix (`HG002.1` with the
     * alias `HG002#1`), or the one `assemblyNameToPanSN` maps to it. A further
     * entry names an assembly by its sample (`HG002`), which takes both of the
     * sample's lanes. A haplotype with no assembly is still a lane, labelled by
     * its PanSN prefix.
     */
    assemblyNames: {
      type: 'stringArray',
      defaultValue: [],
    },
    /**
     * #slot
     * The `.gbz.db` written by `gbz-base construct`; read by HTTP range
     * requests, so it can be large.
     */
    gbzDbLocation: {
      type: 'fileLocation',
      defaultValue: {
        uri: '/path/to/graph.gbz.db',
        locationType: 'UriLocation',
      },
    },
    /**
     * #slot
     * The haplotype index `gbz-haplotype-index` writes beside the graph
     * database, which names its walks. One with stray rows (the tool from
     * 0.2.0) lets a fetch for a chosen set of lanes walk only those
     * haplotypes. Empty means `graph.haplotype-index.db` beside
     * `graph.gbz.db` if there is one; otherwise the walks go unnamed.
     */
    haplotypeIndexLocation: {
      type: 'fileLocation',
      defaultValue: {
        uri: '',
        locationType: 'UriLocation',
      },
    },
    /**
     * #slot
     * Reads aligned to the graph as GAF, which the tube map layouts draw under
     * the haplotypes. Its segment names have to be the cut's: numeric node ids,
     * or `vg giraffe --named-coordinates` on a graph whose segments were
     * renamed or chopped. Empty means no reads.
     */
    readsLocation: {
      type: 'fileLocation',
      defaultValue: {
        uri: '',
        locationType: 'UriLocation',
      },
    },
    /**
     * #slot
     * The `tabix -p gaf` index of a bgzipped `readsLocation`, which fetches the
     * reads over each window's node ids. Empty reads the GAF whole, up to 50 MB.
     */
    readsIndex: ConfigurationSchema('GbzBaseReadsIndex', {
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
    }),
    /**
     * #slot
     * A tab-separated table of per-sample metadata, which the graph view's
     * walk rows group by ("Group by..."). Its header row names the columns
     * (`population`, `superpopulation`, ...), and its first column is the
     * walk's sample (`HG00097`) or haplotype (`HG00097#1`). Empty means no
     * grouping.
     */
    samplesTsvLocation: {
      type: 'fileLocation',
      defaultValue: {
        uri: '',
        locationType: 'UriLocation',
      },
    },
    /**
     * #slot
     * How the graph view's subgraph is extended past the nodes the reference
     * window touches. `contained` adds every top-level snarl with both
     * boundary nodes in the window, which is what brings back the bubbles a
     * reference-only walk leaves out; a haplotype still breaks into a new W
     * line wherever it leaves the window's nodes (a 60 kb C4 window on the
     * HPRC graph: 2,703 nodes, 8,083 walks for 464 haplotypes). `overlapping`
     * also follows snarls that leave the window, so every haplotype is one
     * walk (464), at the price of every node in those snarls (4,184 there,
     * 24,547 across the KIV-2 repeat). `none` leaves only the bp `context`.
     */
    subgraphSnarls: {
      type: 'stringEnum',
      model: types.enumeration('SnarlOutput', [
        'none',
        'contained',
        'overlapping',
      ]),
      defaultValue: GBZ_CUT_DEFAULTS.snarls,
    },
    /**
     * #slot
     * The graph sample the anchor window is located on. Empty means the sample
     * the anchor's PanSN prefix names, or the database's one reference sample
     * (`gbwt_reference_samples`) when the anchor names none; a database with
     * several reference samples then needs this set.
     */
    referenceSample: {
      type: 'string',
      defaultValue: '',
    },
    /**
     * #slot
     * Maps a JBrowse assembly name to its PanSN prefix in the graph, sample or
     * haplotype level (`{ hg38: 'GRCh38#0', 'HG002.1': 'HG002#1' }`). Each
     * session assembly with a `sample#haplotype` alias (`HG002#1`) is mapped to
     * it already, so this is the override: an entry takes its prefix from any
     * assembly aliased to it. An assembly in neither maps to itself.
     */
    assemblyNameToPanSN: {
      type: 'frozen',
      defaultValue: {},
    },
    /**
     * #slot
     * Graph context around the window, in bp, on top of `subgraphSnarls`: the
     * cut, its reference walk and every haplotype walk extend this far past
     * the window on each side. A haplotype walk breaks into pieces wherever it
     * leaves the cut's nodes, so context and snarls together decide whether a
     * lane's bubble is one record or several. A window inside a snarl far
     * larger than itself (MHC class II on the HPRC graph, 90 kb) is 1.1M pieces
     * at 0 and 464 walks at 1000, three times faster.
     */
    context: {
      type: 'number',
      defaultValue: GBZ_CUT_DEFAULTS.context,
      advanced: true,
    },
    /**
     * #slot
     * The most graph nodes one window may load before the query fails rather
     * than reading a whole chromosome into the worker.
     */
    nodeLimit: {
      type: 'number',
      defaultValue: GBZ_CUT_DEFAULTS.limit,
      advanced: true,
    },
  },
  {
    explicitlyTyped: true,

    /**
     * #preProcessSnapshot
     *
     *
     * preprocessor to allow minimal config, where a `.gz` `reads` is taken to
     * be bgzipped with a `.tbi` beside it:
     * ```json
     * {
     *   "type": "GbzBaseSyntenyAdapter",
     *   "uri": "graph.gbz.db",
     *   "reads": "reads.gaf.gz",
     *   "assemblyNames": ["hg38"]
     * }
     * ```
     */
    preProcessSnapshot: snap => {
      const { uri, baseUri, reads } = snap
      return {
        ...snap,
        ...(uri ? { gbzDbLocation: { uri, baseUri } } : {}),
        ...(typeof reads === 'string'
          ? {
              readsLocation: { uri: reads, baseUri },
              ...readsIndexBeside(reads, baseUri),
            }
          : {}),
      }
    },
  },
)

// a bgzipped GAF's index, before any query string its url carries
function readsIndexBeside(reads: string, baseUri: unknown) {
  const { name, query } = splitUri(reads)
  return name.endsWith('.gz')
    ? { readsIndex: { location: { uri: `${name}.tbi${query}`, baseUri } } }
    : {}
}

export type GbzBaseSyntenyAdapterConfig = Instance<typeof GbzBaseSyntenyAdapter>

export default GbzBaseSyntenyAdapter
