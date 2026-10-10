import { GBZBase, SubgraphLimitError } from '@gmod/gbz-base'
import {
  NodeLimitError,
  cutWindowGFA,
  haplotypePrefix,
  haplotypeWanted,
  nodeLimitError,
  referencePathQuery,
  referenceSamplesOf,
  resolveReferenceSample,
} from '@jbrowse/bandage-core/gbzWindow'
import {
  assemblyByPanSNPrefix,
  panSNMatchesPrefix,
  resolvePanSNPrefix,
} from '@jbrowse/bandage-core/pansn'
import { cachedSetup } from '@jbrowse/core/data_adapters/BaseAdapter'
import { getBpDisplayStr, updateStatus } from '@jbrowse/core/util'
import { openLocation } from '@jbrowse/core/util/io'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'

import { findCompanion } from './companion.ts'
import { GafFile } from '../gaf/gafFile.ts'
import { openTabixSlot } from '../panSNTabix.ts'
import { ComparativeAdapterBase } from '../synteny/ComparativeAdapterBase.ts'
import SyntenyFeature from '../synteny/SyntenyFeature.ts'
import { requestedPairs } from '../synteny/lanePairs.ts'

import type { GbzBaseSyntenyAdapterConfig } from './configSchema.ts'
import type { SubgraphAdapterOptions } from '../GetSubgraph.ts'
import type { GafReads } from '../gaf/gafFile.ts'
import type { LaneFeatureOptions, LanePair } from '../synteny/lanePairs.ts'
import type {
  HaplotypeAlignment,
  HaplotypeRef,
  PairAlignment,
  PathName,
  PathQuery,
  Subgraph,
} from '@gmod/gbz-base'
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter'
import type { Feature, SimpleFeatureSerialized } from '@jbrowse/core/util'
import type { FileLocation, Region } from '@jbrowse/core/util/types'

export {
  NoReferenceSampleError,
  resolveReferenceSample,
} from '@jbrowse/bandage-core/gbzWindow'

export class NoHaplotypeIndexError extends Error {
  override name = 'NoHaplotypeIndexError'

  constructor(unreadable?: string) {
    super(
      unreadable === undefined
        ? 'no haplotype index is set, so the walks cannot be named; build one with gbz-haplotype-index (cargo install gbz-haplotype-index) and set it as haplotypeIndexLocation'
        : `the haplotype index beside the graph database could not be checked (${unreadable}), so the walks cannot be named; if it is there, reload to try again, or set haplotypeIndexLocation`,
    )
  }
}

export interface GbzHaplotype {
  prefix: string
  sample: string
  haplotype: number
  contigs: string[]
  isReference: boolean
}

/**
 * One lane the header declares, in the shape MultiWaySyntenyDisplay's lane
 * picker reads: `name` is the lane's assembly name, the same string the
 * fetched features' mates carry, `label` its PanSN prefix and `group` its
 * sample, so a diploid sample's two lanes sit together
 */
export interface GbzHeaderLane {
  name: string
  label: string
  group: string
}

export { PairTargetError } from '../synteny/lanePairs.ts'
export type { LanePair } from '../synteny/lanePairs.ts'
export type GbzFeatureOptions = LaneFeatureOptions

export class HaplotypeWindowError extends Error {
  override name = 'HaplotypeWindowError'

  constructor(assemblyName: string, anchor: string) {
    super(
      `the graph is cut on its reference, ${anchor}; a window on ${assemblyName} has no reference coordinates to cut at. Open the graph from a ${anchor} view, and find this haplotype's lane there`,
    )
  }
}

/**
 * The lane a haplotype draws on: the JBrowse assembly the config maps to it at
 * haplotype or sample depth, else its own PanSN prefix. The fallback stays at
 * haplotype depth, unlike the multi-genome PAF adapters', because a diploid
 * sample's two walks are two lanes here.
 */
export function laneAssemblyName(
  asmByPrefix: Record<string, string>,
  name: Pick<PathName, 'sample' | 'haplotype'>,
) {
  const prefix = haplotypePrefix(name)
  return asmByPrefix[prefix] ?? asmByPrefix[name.sample] ?? prefix
}

/**
 * The id of one haplotype fragment: the walk's GBWT position at its first node
 * in the window, which is a property of the graph, so the same fragment gets
 * the same id on a refetch of the same window and the display's hover and
 * selection survive it. `clipToRegion` suffixes the window.
 */
function fragmentId(name: PathName, alignment: HaplotypeAlignment) {
  return `${haplotypePrefix(name)}#${name.contig}@${alignment.start.node}.${alignment.start.offset}`
}

export function fragmentFeature({
  alignment,
  assemblyName,
  refName,
  lane,
}: {
  alignment: HaplotypeAlignment
  assemblyName: string
  refName: string
  lane: string
}) {
  const { refStart, refEnd, strand, cigar } = alignment
  if (!alignment.resolved || refEnd <= refStart) {
    return undefined
  } else {
    const { name, hapStart, hapEnd } = alignment
    const id = fragmentId(name, alignment)
    const data: SimpleFeatureSerialized = {
      uniqueId: id,
      assemblyName,
      refName,
      start: refStart,
      end: refEnd,
      type: 'match',
      strand: strand === '-' ? -1 : 1,
      CIGAR: cigar,
      syntenyId: id,
      mate: {
        refName: name.contig,
        start: hapStart,
        end: hapEnd,
        assemblyName: lane,
      },
    }
    return new SyntenyFeature(data)
  }
}

/**
 * One record of a lane pair, on the target walk's own contig with the query
 * walk as its mate. gbz-base writes the CIGAR along the target, a `D` being
 * target bases the query lacks, which is the side a JBrowse feature is, so it
 * passes through unchanged.
 */
export function pairFeature({
  pair,
  lane,
  mateLane,
}: {
  pair: PairAlignment
  lane: string
  mateLane: string
}) {
  const id = `${haplotypePrefix(pair.target)}#${pair.target.contig}:${pair.targetStart}-${pair.targetEnd}|${haplotypePrefix(pair.query)}#${pair.query.contig}:${pair.queryStart}-${pair.queryEnd}`
  return new SyntenyFeature({
    uniqueId: id,
    assemblyName: lane,
    refName: pair.target.contig,
    start: pair.targetStart,
    end: pair.targetEnd,
    type: 'match',
    strand: pair.strand === '-' ? -1 : 1,
    CIGAR: pair.cigar,
    syntenyId: id,
    identity: pair.matches / Math.max(pair.columns, 1),
    numMatches: pair.matches,
    blockLen: pair.columns,
    mate: {
      refName: pair.query.contig,
      start: pair.queryStart,
      end: pair.queryEnd,
      assemblyName: mateLane,
    },
  })
}

// The longest detour a pair cut widens its context to take in
const BRIDGE_MAX_BP = 120_000

/**
 * The widest gap, up to `BRIDGE_MAX_BP`, between two pieces of one kept walk:
 * a haplotype that left the cut's nodes for sequence the reference lacks and
 * came back. Two kept haplotypes that share that sequence only align across it
 * once its nodes are in the cut.
 */
export function widestWalkGap(subgraphs: Subgraph[], kept: Set<string>) {
  const byPath = new Map<string, [number, number][]>()
  for (const subgraph of subgraphs) {
    for (const { name, start, end } of subgraph.walkSpans()) {
      const prefix = haplotypePrefix(name)
      if (kept.has(prefix)) {
        const key = `${prefix}#${name.contig}`
        byPath.set(key, [...(byPath.get(key) ?? []), [start, end]])
      }
    }
  }
  let widest = 0
  for (const spans of byPath.values()) {
    spans.sort((a, b) => a[0] - b[0])
    for (let i = 1; i < spans.length; i++) {
      const gap = spans[i]![0] - spans[i - 1]![1]
      if (gap > 0 && gap <= BRIDGE_MAX_BP) {
        widest = Math.max(widest, gap)
      }
    }
  }
  return widest
}

// A window past the node limit fails as a zoom-in notice naming a span that
// fits
function zoomInNotice(error: unknown, what: string) {
  if (error instanceof NodeLimitError) {
    error.message = `Zoom in to about ${getBpDisplayStr(error.fitsBp)} to see ${what}`
  }
  return error
}

const isSet = (location: FileLocation) =>
  !('uri' in location) || location.uri !== ''

export default class GbzBaseSyntenyAdapter extends ComparativeAdapterBase<GbzBaseSyntenyAdapterConfig> {
  private graph = cachedSetup({
    label: 'Opening pangenome database',
    setup: async () => {
      const gbzDb: FileLocation = this.getConf('gbzDbLocation')
      const configured: FileLocation = this.getConf('haplotypeIndexLocation')
      const companion = isSet(configured)
        ? { location: configured }
        : await findCompanion(gbzDb, this.pluginManager)
      const indexLocation = companion.location
      const db = await GBZBase.open({
        source: openLocation(gbzDb, this.pluginManager),
        haplotypeIndex: indexLocation
          ? openLocation(indexLocation, this.pluginManager)
          : undefined,
      })
      const anchor = this.getConf('assemblyNames')[0]
      if (anchor === undefined) {
        throw new Error(
          'GbzBaseSyntenyAdapter needs assemblyNames: its first entry is the assembly the reference sample is loaded as',
        )
      }
      const referenceSamples = await referenceSamplesOf(db)
      const referenceSample = resolveReferenceSample({
        configured: this.getConf('referenceSample'),
        anchorPrefix: resolvePanSNPrefix(this, anchor),
        referenceSamples,
      })
      return {
        db,
        anchor,
        referenceSample,
        referenceSamples,
        unreadableIndex: companion.unreadable,
      }
    },
  })

  /**
   * The indexed reference path a window on `refName` resolves against, or
   * undefined when the reference sample has no indexed path by that contig.
   */
  private async referenceQuery(
    refName: string,
    opts: BaseOptions,
  ): Promise<PathQuery | undefined> {
    const { db, referenceSample } = await this.graph(opts)
    return referencePathQuery(db, referenceSample, refName)
  }

  /**
   * Every haplotype the graph carries a walk for, `sample#haplotype` with its
   * contigs, from the Paths scan the adapter already makes; the lane picker's
   * source list. Reference samples are included and flagged.
   */
  async getHaplotypes(opts: BaseOptions = {}): Promise<GbzHaplotype[]> {
    const { db, referenceSamples } = await this.graph(opts)
    const byPrefix = new Map<string, GbzHaplotype>()
    for (const path of await db.paths()) {
      const prefix = haplotypePrefix(path.name)
      const entry = byPrefix.get(prefix)
      if (entry) {
        if (!entry.contigs.includes(path.name.contig)) {
          entry.contigs.push(path.name.contig)
        }
      } else {
        byPrefix.set(prefix, {
          prefix,
          sample: path.name.sample,
          haplotype: path.name.haplotype,
          contigs: [path.name.contig],
          isReference: referenceSamples.includes(path.name.sample),
        })
      }
    }
    return [...byPrefix.values()]
  }

  /**
   * `lanes` is every haplotype but the reference sample's own, which is the
   * anchor rather than a lane, declared up front so the display can offer the
   * whole graph's haplotypes before a fetch has placed any of them.
   */
  async getHeader(opts: BaseOptions = {}) {
    const { anchor, referenceSample, referenceSamples } = await this.graph(opts)
    const asmByPrefix = assemblyByPanSNPrefix(this)
    const lanes: GbzHeaderLane[] = []
    for (const haplotype of await this.getHaplotypes(opts)) {
      if (haplotype.sample !== referenceSample) {
        lanes.push({
          name: laneAssemblyName(asmByPrefix, haplotype),
          label: haplotype.prefix,
          group: haplotype.sample,
        })
      }
    }
    return {
      hasCoarseTier: false,
      anchorAssemblyName: anchor,
      referenceSample,
      referenceSamples,
      lanes,
    }
  }

  async getRefNames(opts: BaseOptions = {}) {
    const { db, anchor, referenceSample } = await this.graph(opts)
    const { assemblyName } = opts
    const prefix =
      assemblyName === anchor
        ? undefined
        : resolvePanSNPrefix(this, assemblyName)
    const contigs = (await db.paths())
      .filter(path =>
        assemblyName === anchor
          ? path.isIndexed && path.name.sample === referenceSample
          : panSNMatchesPrefix(haplotypePrefix(path.name), prefix),
      )
      .map(path => path.name.contig)
    return [...new Set(contigs)]
  }

  /**
   * The predicate gbz-base builds a window for, from the lanes a fetch asks
   * for. With a companion whose stray rows cover the window gbz-base walks
   * only the wanted haplotypes; otherwise it names every walk and keeps the
   * ones the predicate accepts, and throws rather than guess when a walk has
   * no name. Either way a cut holds those walks, the reference, and the nodes
   * they visit. Undefined when every haplotype is wanted.
   */
  //
  // `targetPrefix` is a pairwise view's one lane, and it belongs in here: left
  // to filter what came back, it handed gbz-base no predicate, and every
  // haplotype in the graph was walked for one to be kept.
  private keepPredicate(
    haplotypes: string[] | undefined,
    targetPrefix?: string,
  ) {
    const wantedPrefixes =
      haplotypes === undefined || haplotypes.length === 0
        ? undefined
        : haplotypes.map(lane => resolvePanSNPrefix(this, lane))
    return wantedPrefixes === undefined && targetPrefix === undefined
      ? undefined
      : (name: PathName) =>
          haplotypeWanted(name, wantedPrefixes) &&
          (targetPrefix === undefined ||
            panSNMatchesPrefix(haplotypePrefix(name), targetPrefix))
  }

  /**
   * The graph view's cut of the window: the reference walk, every top-level
   * snarl contained in it, and one W line per haplotype walk, PanSN-named
   * when the database (or its companion) carries the haplotype index and
   * `unknown#N` otherwise. The reference walk is the first W line, which is
   * the one the view anchors on by default. With `haplotypes` the W lines are
   * that set's and the nodes those walks visit, the reference walk kept.
   *
   * Only a window on the anchor can be cut: a haplotype lane's coordinates
   * are its own contig's, and the graph is indexed for random access on the
   * reference sample's paths alone.
   */
  async getSubgraph(region: Region, opts: SubgraphAdapterOptions = {}) {
    const { signal } = opts
    const { db, anchor, referenceSample, unreadableIndex } = await this.graph({
      signal,
    })
    const { assemblyName, refName, start, end } = region
    if (assemblyName !== anchor) {
      throw new HaplotypeWindowError(assemblyName, anchor)
    }
    const query = await this.referenceQuery(refName, { signal })
    if (!query) {
      throw new Error(
        `${referenceSample} has no indexed path ${refName} in this graph`,
      )
    }
    const keep = this.keepPredicate(opts.haplotypes)
    if (keep !== undefined && !db.hasHaplotypeIndex) {
      throw new NoHaplotypeIndexError(unreadableIndex)
    }
    return cutWindowGFA(db, query, start, end, {
      context: this.getConf('context'),
      snarls: opts.snarls ?? this.getConf('subgraphSnarls'),
      limit: this.getConf('nodeLimit'),
      signal: opts.signal,
      keep,
    }).catch((error: unknown) => {
      throw zoomInNotice(error, 'the graph')
    })
  }

  private gaf = cachedSetup({
    label: 'Opening reads',
    setup: async () => {
      const location: FileLocation = this.getConf('readsLocation')
      const index: FileLocation = this.getConf(['readsIndex', 'location'])
      return isSet(location)
        ? new GafFile(
            openLocation(location, this.pluginManager),
            isSet(index)
              ? openTabixSlot(this, ['readsLocation'], ['readsIndex'])
              : undefined,
          )
        : undefined
    },
  })

  /**
   * The reads over a cut's segments, from `readsLocation`, sampled down to
   * what the tube map lays out at interactive speed
   */
  async getReads(
    nodeNames: string[],
    opts: BaseOptions = {},
  ): Promise<GafReads> {
    const gaf = await this.gaf(opts)
    return gaf
      ? gaf.readsOver(new Set(nodeNames), opts)
      : { records: [], total: 0 }
  }

  private async laneHaplotypes(
    assemblyName: string,
    opts: BaseOptions,
  ): Promise<HaplotypeRef[]> {
    const prefix = resolvePanSNPrefix(this, assemblyName)
    return (await this.getHaplotypes(opts)).filter(haplotype =>
      panSNMatchesPrefix(haplotype.prefix, prefix),
    )
  }

  private async anchorFeatures(region: Region, opts: GbzFeatureOptions) {
    const { db } = await this.graph(opts)
    const { assemblyName, refName, start, end } = region
    const targetPrefix = resolvePanSNPrefix(this, opts.targetAssemblyName)
    const asmByPrefix = assemblyByPanSNPrefix(this)
    const keep = this.keepPredicate(opts.haplotypes, targetPrefix)
    const query = await this.referenceQuery(refName, opts)
    const nodeLimit: number = this.getConf('nodeLimit')
    const alignments = query
      ? await updateStatus(
          `Reading graph ${refName}:${start.toLocaleString()}-${end.toLocaleString()}`,
          opts.statusCallback,
          () =>
            db
              .getAlignments({
                path: query,
                start,
                end,
                context: this.getConf('context'),
                haplotypes: 'all',
                limit: nodeLimit,
                signal: opts.signal,
                keep,
              })
              .catch((error: unknown) => {
                throw zoomInNotice(
                  nodeLimitError(error, nodeLimit, end - start) ?? error,
                  'lanes',
                )
              }),
        )
      : []
    return alignments.flatMap(alignment => {
      const feature = alignment.resolved
        ? fragmentFeature({
            alignment,
            assemblyName,
            refName,
            lane: laneAssemblyName(asmByPrefix, alignment.name),
          })
        : undefined
      return feature === undefined ? [] : [feature]
    })
  }

  /**
   * Each pair's two lanes cut out of the anchor window alone, all pairs in one
   * cut, and each walk of a pair's query lane aligned to each walk of its
   * target lane on the nodes both visit, with no base compared. A pair's
   * records sit on its query lane's contigs, the lane the display draws on top.
   *
   * Whether the index has anchor rows changes only how fast gbz-base finds
   * the walks: both routes cut the same pieces.
   */
  private async pairFeatures(
    region: Region,
    pairs: LanePair[],
    opts: GbzFeatureOptions,
  ) {
    const { db } = await this.graph(opts)
    const { refName, start, end } = region
    const sides = await Promise.all(
      pairs.map(async pair => ({
        pair,
        featureSide: await this.laneHaplotypes(pair.queryAssemblyName, opts),
        mateSide: await this.laneHaplotypes(pair.targetAssemblyName, opts),
      })),
    )
    const answerable = sides.filter(
      ({ featureSide, mateSide }) =>
        featureSide.length > 0 && mateSide.length > 0,
    )
    const kept = new Set(
      answerable.flatMap(({ featureSide, mateSide }) =>
        [...featureSide, ...mateSide].map(haplotypePrefix),
      ),
    )
    const query = await this.referenceQuery(refName, opts)
    const nodeLimit: number = this.getConf('nodeLimit')
    const baseContext: number = this.getConf('context')
    const [first] = pairs
    const cut = (path: PathQuery, context: number) =>
      db.getSubgraphs({
        path,
        start,
        end,
        context,
        snarls: this.getConf('subgraphSnarls'),
        haplotypes: 'all',
        limit: nodeLimit,
        signal: opts.signal,
        keep: name => kept.has(haplotypePrefix(name)),
      })
    // a cut past the node limit for the wider context keeps the first one
    const bridged = async (path: PathQuery) => {
      const subgraphs = await cut(path, baseContext).catch((error: unknown) => {
        throw zoomInNotice(
          nodeLimitError(error, nodeLimit, end - start) ?? error,
          'lanes',
        )
      })
      const gap = widestWalkGap(subgraphs, kept)
      const context = Math.ceil(gap / 2) + 2000
      return gap > 0 && context > baseContext
        ? cut(path, context).catch((error: unknown) => {
            if (error instanceof SubgraphLimitError) {
              return subgraphs
            }
            throw error
          })
        : subgraphs
    }
    const subgraphs =
      query && first && answerable.length > 0
        ? await updateStatus(
            pairs.length === 1
              ? `Reading ${first.queryAssemblyName} against ${first.targetAssemblyName}`
              : `Reading ${pairs.length} lane pairs`,
            opts.statusCallback,
            () => bridged(query),
          )
        : []
    return subgraphs.flatMap(subgraph =>
      answerable.flatMap(({ pair, featureSide, mateSide }) =>
        featureSide.flatMap(target =>
          mateSide.flatMap(mate =>
            subgraph
              .pairAlignments({ target, query: mate, bases: false })
              .map(alignment =>
                pairFeature({
                  pair: alignment,
                  lane: pair.queryAssemblyName,
                  mateLane: pair.targetAssemblyName,
                }),
              ),
          ),
        ),
      ),
    )
  }

  getFeatures(region: Region, opts: GbzFeatureOptions = {}) {
    return ObservableCreate<Feature>(async observer => {
      const { db, anchor, unreadableIndex } = await this.graph(opts)
      if (!db.hasHaplotypeIndex) {
        throw new NoHaplotypeIndexError(unreadableIndex)
      }
      // the graph is indexed on its reference alone, so a window on a
      // haplotype lane has no answer: a lane pair is read inside the anchor's
      if (region.assemblyName === anchor) {
        const pairs = requestedPairs(opts)
        const features =
          pairs.length > 0
            ? await this.pairFeatures(region, pairs, opts)
            : await this.anchorFeatures(region, opts)
        for (const feature of features) {
          observer.next(feature)
        }
      }
      observer.complete()
    }, opts.signal)
  }
}
