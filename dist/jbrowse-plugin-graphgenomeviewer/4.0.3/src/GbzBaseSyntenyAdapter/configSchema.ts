import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { types } from '@jbrowse/mobx-state-tree'

import type { Instance } from '@jbrowse/mobx-state-tree'

/**
 * #config GbzBaseSyntenyAdapter
 * #trackType SyntenyTrack
 * #fileFormat synteny | gbz-base pangenome database | Haplotype alignments read from the graph at query time, no PAF conversion
 * Serves a pangenome graph stored as a gbz-base SQLite database (`.gbz.db`) as
 * haplotype-versus-reference alignments, the shape `MultiWaySyntenyDisplay`
 * draws as one lane per haplotype. A window on the reference is located on the
 * graph's reference path, every haplotype's walk through the nodes it covers
 * is recovered and named, and each haplotype becomes one alignment record with
 * a CIGAR, so the graph is read through HTTP range requests with no offline
 * conversion. The database has to carry the `HaplotypeSamples` and
 * `HaplotypeLengths` side tables that `gbz-haplotype-index` (shipped with
 * `@gmod/gbz-base`) writes into an upstream-built database; without them the
 * graph cannot say which haplotype a walk belongs to.
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
     * sample is loaded as. Further entries are haplotypes loaded as JBrowse
     * assemblies under their PanSN prefix (`HG002#1`); one loaded under another
     * name only needs its `assemblyNameToPanSN` entry. A haplotype named in
     * neither is still a lane, labelled by its PanSN prefix.
     */
    assemblyNames: {
      type: 'stringArray',
      defaultValue: [],
    },
    /**
     * #slot
     * The `.gbz.db` written by `gbz-base construct` and augmented by
     * `gbz-haplotype-index`; read by HTTP range requests, so it can be large.
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
     * A companion database written by `gbz-haplotype-index --output`, holding
     * the `HaplotypeSamples` and `HaplotypeLengths` tables for a graph database
     * that does not carry them itself, such as the one HPRC publishes. One
     * built with anchor rows (the tool's default) lets a fetch for a chosen
     * set of lanes walk only those haplotypes. Empty means the graph database
     * carries the tables.
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
      defaultValue: 'contained',
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
     * haplotype level (`{ hg38: 'GRCh38#0', 'HG002.1': 'HG002#1' }`). Defaults
     * to identity.
     */
    assemblyNameToPanSN: {
      type: 'frozen',
      defaultValue: {},
    },
    /**
     * #slot
     * Graph context around the reference walk, in bp, on top of
     * `subgraphSnarls`. Since `@gmod/gbz-base` joins the pieces of a walk that
     * leaves the window's nodes and comes back (the private stretch becomes the
     * record's insertion, the skipped reference its deletion), a lane's record
     * count is one per haplotype at any context; what context trades is nodes
     * read against pieces to identify and join. A window inside a snarl far
     * larger than itself (MHC class II on the HPRC graph, 90 kb) is 1.1M pieces
     * at 0 and 464 walks at 1000, three times faster; a window whose private
     * stretches are short bubbles costs about the same either way. For the
     * graph view's cut it is simply how far past the window the cut extends.
     */
    context: {
      type: 'number',
      defaultValue: 1000,
      advanced: true,
    },
    /**
     * #slot
     * The most graph nodes one window may load before the query fails rather
     * than reading a whole chromosome into the worker.
     */
    nodeLimit: {
      type: 'number',
      defaultValue: 100000,
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
     *   "type": "GbzBaseSyntenyAdapter",
     *   "uri": "graph.gbz.db",
     *   "assemblyNames": ["hg38"]
     * }
     * ```
     */
    preProcessSnapshot: snap => {
      return snap.uri
        ? {
            ...snap,
            gbzDbLocation: {
              uri: snap.uri,
              baseUri: snap.baseUri,
            },
          }
        : snap
    },
  },
)

export type GbzBaseSyntenyAdapterConfig = Instance<typeof GbzBaseSyntenyAdapter>

export default GbzBaseSyntenyAdapter
