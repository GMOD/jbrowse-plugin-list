import { panSNHaplotype, resolvePanSNPrefix } from '@jbrowse/bandage-core/pansn'
import {
  BaseFeatureDataAdapter,
  cachedSetup,
} from '@jbrowse/core/data_adapters/BaseAdapter'
import { SimpleFeature, updateStatus } from '@jbrowse/core/util'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'

import { PanSNRefNames, openTabixSlot } from '../panSNTabix.ts'
import {
  anchoredCut,
  closingLinks,
  closingSpans,
  formatSubgraph,
  linkKey,
  parseLinkLine,
  parseSegmentRow,
  segmentSamples,
} from './rgfaBed.ts'
import {
  WalkGraph,
  chunkQueryStart,
  headerChunk,
  joinPieces,
  parseWalkRow,
  stepBudgetError,
  walkCut,
  walkNameFilter,
  walkRowName,
} from './walkRows.ts'

import type { RgfaTabixAdapterConfig } from './configSchema.ts'
import type { WalkRow } from './walkRows.ts'
import type { SubgraphAdapterOptions, SubgraphTier } from '../GetSubgraph.ts'
import type { RgfaLink, RgfaSegment } from './rgfaBed.ts'
import type { TabixIndexedFile } from '@gmod/tabix'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter'
import type { getSubAdapterType } from '@jbrowse/core/data_adapters/dataAdapterCache'
import type { Feature } from '@jbrowse/core/util'
import type { FileLocation, Region } from '@jbrowse/core/util/types'

// What a hop follows: alleles, never the backbone. A rank-0 segment reached
// through a link is flanking backbone, usually outside the window, so querying
// its links walks the reference away from the region, brings back more backbone,
// and closes nothing. Every segment that closes a bubble is an allele interior,
// and an allele interior is rank > 0 in both index formats (rGFA's SR tag, and
// pggb's rank 0-or-1 against the anchor path). Reached backbone still becomes a
// node and its edge still draws; it is only not walked through.
//
// This is gfabase's rule, arrived at from the other end. `gfabase sub` expands
// from a seed either to the whole connected component (`--connected`, which its
// own README calls overkill) or with `--cutpoints 1`, which takes the biconnected
// component by *stopping at cutpoints*, the segments every end-to-end walk of
// the chromosome must traverse. In a reference-anchored pangenome the cutpoints
// are the backbone, and rank is what the index already states about it, so
// `rank > 0` is that stopping rule without a connectivity index to build. The
// third tool is the same shape again: `gfatools view -R` maps the region onto its
// precomputed bubble decomposition and returns whole overlapping bubbles
// (gfa_query_by_reg), which is complete for the same reason. Bandage's own
// `--distance` is a node-step radius, but Bandage holds the entire graph in
// memory, so its scope is a drawing filter rather than a fetch strategy.
//
// Measured with this rule: the E. coli paa window converges at one hop (17
// segments at 1 and at 2), so the cut closes and stays closed. HPRC's amylase
// window keeps growing (63 at 0, 78 at 1, 92 at 2) because its alleles have
// alleles, and wall-clock is flat across all three, since a hop's queries go out
// together and the remote index dominates.
//
// The exact version, when a graph ships a bubble index beside its segments:
// gfatools' bubble rows carry the member segment ids of every bubble, so the
// bubbles overlapping the region state which segments a complete cut must
// contain. That turns the hop count into a termination condition rather than a
// setting, and MinigraphBubbleAdapter already parses those rows.
function offReference(segments: RgfaSegment[]) {
  return segments.filter(segment => segment.rank > 0)
}

interface GraphIndex {
  segments: TabixIndexedFile
  links: TabixIndexedFile
  walks?: TabixIndexedFile
  refNames: PanSNRefNames
}

// How much graph a walk cut keeps around the window, on the reference
const WALK_CONTEXT = 1000

export default class RgfaTabixAdapter extends BaseFeatureDataAdapter<RgfaTabixAdapterConfig> {
  public static capabilities = ['getFeatures', 'getRefNames']

  private readonly fine
  private coarse: GraphIndex | undefined

  public constructor(
    config: RgfaTabixAdapterConfig,
    getSubAdapter?: getSubAdapterType,
    pluginManager?: PluginManager,
  ) {
    super(config, getSubAdapter, pluginManager)
    this.fine = this.openIndex([])
  }

  // refNames off the SEGMENT index: it is the one that names every stable
  // sequence the graph is anchored to, where the link index only names those a
  // link touches.
  private openIndex(under: string[]): GraphIndex {
    const segments = openTabixSlot(
      this,
      [...under, 'segmentsLocation'],
      [...under, 'segmentsIndex'],
    )
    const walksLocation: FileLocation = this.getConf('walksLocation')
    const hasWalks =
      under.length === 0 &&
      (!('uri' in walksLocation) || walksLocation.uri !== '')
    return {
      segments,
      links: openTabixSlot(
        this,
        [...under, 'linksLocation'],
        [...under, 'linksIndex'],
      ),
      walks: hasWalks
        ? openTabixSlot(this, ['walksLocation'], ['walksIndex'])
        : undefined,
      refNames: new PanSNRefNames(segments, this),
    }
  }

  // The chunk a walk-indexed graph files its rows under, as the walk file's
  // header states it, else the walkChunk slot
  private walkChunk = cachedSetup({
    setup: async opts => {
      const walks = this.fine.walks
      const stated = walks
        ? headerChunk(await walks.getHeaderLines(opts))
        : undefined
      const slot: number = this.getConf('walkChunk')
      return stated ?? slot
    },
  })

  private index(tier: SubgraphTier = 'fine') {
    if (tier === 'fine') {
      return this.fine
    }
    this.coarse ??= this.openIndex(['coarse'])
    return this.coarse
  }

  async getRefNames(opts: BaseOptions = {}) {
    return this.fine.refNames.assemblyRefNames(opts)
  }

  public async hasDataForRefName() {
    return true
  }

  getFeatures(query: Region, opts: BaseOptions = {}) {
    const { signal, statusCallback } = opts
    return ObservableCreate<Feature>(async observer => {
      const tabixRefName = await this.fine.refNames.resolve(query, opts)
      if (tabixRefName !== undefined) {
        // a walk-indexed node row names only its chunk's first base, and a
        // node crossing in from the chunk before is filed there
        const chunk = this.fine.walks ? await this.walkChunk(opts) : 0
        const start =
          chunk > 0 ? chunkQueryStart(query.start, chunk) : query.start
        await updateStatus('Downloading segments', statusCallback, () =>
          this.fine.segments.getLines(tabixRefName, start, query.end, {
            signal,
            lineCallback: line => {
              const { segment, anchored } = parseSegmentRow(line)
              // An anchored index also returns the alleles under the region,
              // which lie on other stable sequences and have no place on this
              // one.
              if (anchored && segment.refName !== tabixRefName) {
                return
              }
              // `samples` lists the haplotypes whose paths visit the segment and
              // `sampleCount` counts them. A lane's color reads the count, and
              // a count in jexl would otherwise rely on `.length` resolving
              // through a member access on an array.
              const samples = segmentSamples(segment)
              observer.next(
                new SimpleFeature({
                  uniqueId: segment.id,
                  refName: query.refName,
                  start: segment.start,
                  end: segment.end,
                  name: segment.id,
                  type: 'segment',
                  rank: segment.rank,
                  stableName: segment.refName,
                  ...(samples && { samples, sampleCount: samples.length }),
                }),
              )
            },
          }),
        )
      }
      observer.complete()
    }, signal)
  }

  // Extract the graph around a region as GFA text, for GraphGenomeView. The
  // region's own segments come from segs.bed.gz; links.bed.gz supplies the edges
  // incident to them *and* the coordinates of the segments on the other end,
  // which typically sit on a different stable sequence (a rank>0 bubble) and so
  // are not reachable by any coordinate query on this region.
  //
  // `hops` is extra rounds of link-following past the region's own segments
  // and their immediate neighbours, each costing one tabix query per
  // off-reference segment newly reached. After the last round, one more read
  // per stretch of stable sequence the cut holds closes it (closingSpans), so
  // an allele reached from both ends draws whole. The view asks for one hop; a
  // hopless cut stays as cheap as it was. `signal` goes to every one of those
  // queries, so a cut the view has replaced stops.
  // `tier: 'coarse'` reads the `coarse` pair instead, the same way.
  async getSubgraph(region: Region, opts: SubgraphAdapterOptions = {}) {
    const { hops = 0, signal, tier } = opts
    const index = this.index(tier)
    const segments = new Map<string, RgfaSegment>()
    const links = new Map<string, RgfaLink>()
    const tabixRefName = await index.refNames.resolve(region, { signal })

    const addLinksOver = async (
      refName: string,
      start: number,
      end: number,
    ) => {
      const reached: RgfaSegment[] = []
      await index.links.getLines(refName, start, end, {
        signal,
        lineCallback: line => {
          const link = parseLinkLine(line)
          links.set(linkKey(link), link)
          for (const segment of [link.sourceSegment, link.targetSegment]) {
            if (!segments.has(segment.id)) {
              segments.set(segment.id, segment)
              reached.push(segment)
            }
          }
        },
      })
      return reached
    }

    if (tabixRefName === undefined) {
      throw new Error(
        `${region.assemblyName} ${region.refName} is not in this graph's index; a graph with PanSN names (GRCh38#0#chr1) needs ${region.assemblyName} mapped to its prefix in assemblyNameToPanSN`,
      )
    }
    if (index.walks) {
      return this.walkSubgraph(index, index.walks, tabixRefName, region, opts)
    }
    const layout = { anchored: false }
    await index.segments.getLines(tabixRefName, region.start, region.end, {
      signal,
      lineCallback: line => {
        const row = parseSegmentRow(line)
        layout.anchored ||= row.anchored
        segments.set(row.segment.id, row.segment)
      },
    })
    // An anchored index files every allele and every link under the reference
    // interval its bubble hangs from, so one read of each file holds the whole
    // graph under the region and there is nothing to hop to or close.
    if (layout.anchored) {
      const found: RgfaLink[] = []
      await index.links.getLines(tabixRefName, region.start, region.end, {
        signal,
        lineCallback: line => {
          found.push(parseLinkLine(line))
        },
      })
      const cut = anchoredCut(segments, found, {
        refName: tabixRefName,
        start: region.start,
        end: region.end,
      })
      return formatSubgraph(cut.segments, cut.links)
    }
    let frontier = offReference(
      await addLinksOver(tabixRefName, region.start, region.end),
    )
    for (let hop = 0; hop < hops; hop++) {
      // One hop's queries are independent of each other, so they go out
      // together rather than one round-trip at a time. Their callbacks share
      // the segment and link maps, which is safe because only one of them runs
      // at a time, and the output is sorted at the end regardless of the order
      // they arrive in.
      const reached = await Promise.all(
        frontier.map(segment =>
          addLinksOver(segment.refName, segment.start, segment.end),
        ),
      )
      frontier = offReference(reached.flat())
    }
    if (hops > 0) {
      const spans = closingSpans(
        [...segments.values()],
        new Set(frontier.map(segment => segment.id)),
        { refName: tabixRefName, start: region.start, end: region.end },
      )
      const found: RgfaLink[] = []
      await Promise.all(
        spans.map(span =>
          index.links.getLines(span.refName, span.start, span.end, {
            signal,
            lineCallback: line => {
              found.push(parseLinkLine(line))
            },
          }),
        ),
      )
      for (const link of closingLinks(found, segments, spans)) {
        links.set(linkKey(link), link)
        for (const segment of [link.sourceSegment, link.targetSegment]) {
          if (!segments.has(segment.id)) {
            segments.set(segment.id, segment)
          }
        }
      }
    }

    return formatSubgraph(segments, links)
  }

  // A walk-indexed graph's cut: one read of each file over whole chunks, from
  // the chunk before the window to its end. Only the walks `haplotypes` asks
  // for, and the reference's, are decoded, and none is past walkStepBudget:
  // the three reads go out together and a walk read over budget stops the
  // other two.
  private async walkSubgraph(
    index: GraphIndex,
    walks: TabixIndexedFile,
    refName: string,
    region: Region,
    opts: SubgraphAdapterOptions,
  ) {
    const { signal, haplotypes } = opts
    const chunk = await this.walkChunk({ signal })
    const budget: number = this.getConf('walkStepBudget')
    const keep = walkNameFilter(
      haplotypes?.map(lane => resolvePanSNPrefix(this, lane)),
      panSNHaplotype(refName),
    )
    const from = chunkQueryStart(region.start, chunk)
    const reads = new AbortController()
    const stop = () => {
      reads.abort(signal?.reason)
    }
    signal?.addEventListener('abort', stop, { once: true })
    const rows: WalkRow[] = []
    const graph = new WalkGraph({
      refName,
      start: region.start,
      end: region.end,
      context: WALK_CONTEXT,
    })
    const read = (
      file: TabixIndexedFile,
      lineCallback: (line: string) => void,
    ) =>
      file.getLines(refName, from, region.end, {
        signal: reads.signal,
        lineCallback,
      })
    try {
      await Promise.all([
        read(walks, line => {
          if (keep === undefined || keep(walkRowName(line))) {
            rows.push(parseWalkRow(line))
          }
        }).then(() => {
          const error = stepBudgetError(
            rows,
            budget,
            region,
            chunk,
            keep !== undefined,
          )
          if (error) {
            throw error
          }
        }),
        read(index.segments, line => {
          graph.addNode(line)
        }),
        read(index.links, line => {
          graph.addLink(line)
        }),
      ])
    } catch (error) {
      reads.abort()
      throw error
    } finally {
      signal?.removeEventListener('abort', stop)
    }
    const { kept, fragments } = walkCut(joinPieces(rows), graph.nodes)
    return graph.format(kept, fragments)
  }
}
