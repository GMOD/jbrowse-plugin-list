import { GBZBase } from '@gmod/gbz-base'
import { cachedSetup } from '@jbrowse/core/data_adapters/BaseAdapter'
import { updateStatus } from '@jbrowse/core/util'
import { openLocation } from '@jbrowse/core/util/io'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'

import {
  assemblyByPanSNPrefix,
  panSNMatchesPrefix,
  panSNSample,
  resolvePanSNPrefix,
} from '../pansn.ts'
import { ComparativeAdapterBase } from '../synteny/ComparativeAdapterBase.ts'
import SyntenyFeature from '../synteny/SyntenyFeature.ts'

import type { GbzBaseSyntenyAdapterConfig } from './configSchema.ts'
import type { SubgraphAdapterOptions } from '../GetSubgraph.ts'
import type { HaplotypeAlignment, PathName, PathQuery } from '@gmod/gbz-base'
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter'
import type { Feature, SimpleFeatureSerialized } from '@jbrowse/core/util'
import type { FileLocation, Region } from '@jbrowse/core/util/types'
import type { ComparativeOptions } from '@jbrowse/synteny-core'

export class NoHaplotypeIndexError extends Error {
  override name = 'NoHaplotypeIndexError'

  constructor() {
    super(
      'this .gbz.db has no HaplotypeSamples/HaplotypeLengths tables, so its walks cannot be named; run gbz-haplotype-index (from @gmod/gbz-base) over it first',
    )
  }
}

export class NoReferenceSampleError extends Error {
  override name = 'NoReferenceSampleError'

  constructor(anchor: string, referenceSamples: string[]) {
    super(
      referenceSamples.length === 0
        ? `the graph names no reference sample (gbwt_reference_samples) and the anchor "${anchor}" maps to none; set referenceSample`
        : `the anchor "${anchor}" is none of the graph's reference samples (${referenceSamples.join(', ')}); set referenceSample or map it through assemblyNameToPanSN`,
    )
  }
}

export function haplotypePrefix(name: Pick<PathName, 'sample' | 'haplotype'>) {
  return `${name.sample}#${name.haplotype}`
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

/**
 * `haplotypes` narrows a fetch to the lanes listed: PanSN prefixes at sample
 * (`HG002`) or haplotype (`HG002#1`) depth, or assembly names the config maps
 * to one; undefined is every haplotype.
 */
export interface GbzFeatureOptions extends ComparativeOptions {
  haplotypes?: string[]
}

function haplotypeWanted(name: PathName, wanted: string[] | undefined) {
  const prefix = haplotypePrefix(name)
  return (
    wanted === undefined ||
    wanted.some(candidate => panSNMatchesPrefix(prefix, candidate))
  )
}

export class HaplotypeWindowError extends Error {
  override name = 'HaplotypeWindowError'

  constructor(assemblyName: string, anchor: string) {
    super(
      `the graph is cut on its reference, ${anchor}; a window on ${assemblyName} has no reference coordinates to cut at. Open the graph from a ${anchor} view, and find this haplotype's lane there`,
    )
  }
}

export class NodeLimitError extends Error {
  override name = 'NodeLimitError'

  constructor(limit: number, windowBp: number, fitsBp: number) {
    super(
      `this ${windowBp.toLocaleString()} bp window reads more than nodeLimit (${limit.toLocaleString()}) graph nodes; zoom in to about ${fitsBp.toLocaleString()} bp or raise nodeLimit`,
    )
  }
}

/**
 * gbz-base reports the node limit with how far along the reference the walk
 * had got when it tripped; a window that fits is that far, with a margin, or
 * half the window when the limit tripped while extending past the reference.
 */
export function nodeLimitError(
  error: unknown,
  limit: number,
  windowBp: number,
) {
  const isLimit =
    error instanceof Error &&
    (error.name === 'SubgraphLimitError' ||
      /^Subgraph size limit of \d+ nodes exceeded/.test(error.message))
  if (!isLimit) {
    return undefined
  } else {
    const walked = (error as { walkedBp?: unknown }).walkedBp
    const fits =
      typeof walked === 'number' && walked > 0
        ? Math.floor(walked * 0.8)
        : Math.floor(windowBp / 2)
    return new NodeLimitError(limit, windowBp, Math.max(fits, 1))
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

export function resolveReferenceSample({
  configured,
  anchorPrefix,
  referenceSamples,
}: {
  configured: string
  anchorPrefix: string
  referenceSamples: string[]
}) {
  const fromAnchor = panSNSample(anchorPrefix)
  if (configured !== '') {
    return configured
  } else if (referenceSamples.includes(fromAnchor)) {
    return fromAnchor
  } else if (referenceSamples.length === 1) {
    return referenceSamples[0]!
  } else {
    throw new NoReferenceSampleError(anchorPrefix, referenceSamples)
  }
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

export default class GbzBaseSyntenyAdapter extends ComparativeAdapterBase<GbzBaseSyntenyAdapterConfig> {
  private graph = cachedSetup({
    label: 'Opening pangenome database',
    setup: async () => {
      const indexLocation: FileLocation = this.getConf('haplotypeIndexLocation')
      const hasCompanion = !('uri' in indexLocation) || indexLocation.uri !== ''
      const db = await GBZBase.open(
        openLocation(this.getConf('gbzDbLocation'), this.pluginManager),
        hasCompanion
          ? {
              haplotypeIndex: openLocation(indexLocation, this.pluginManager),
            }
          : {},
      )
      const anchor = this.getConf('assemblyNames')[0]
      if (anchor === undefined) {
        throw new Error(
          'GbzBaseSyntenyAdapter needs assemblyNames: its first entry is the assembly the reference sample is loaded as',
        )
      }
      const referenceSamples = ((await db.tag('gbwt_reference_samples')) ?? '')
        .split(/\s+/)
        .filter(sample => sample !== '')
      const referenceSample = resolveReferenceSample({
        configured: this.getConf('referenceSample'),
        anchorPrefix: resolvePanSNPrefix(this, anchor),
        referenceSamples,
      })
      return { db, anchor, referenceSample, referenceSamples }
    },
  })

  /**
   * The indexed reference path a window on `refName` resolves against, or
   * undefined when the reference sample has no indexed path by that contig.
   * gbz-base spans the path's fragments itself from here.
   */
  private async referenceQuery(
    refName: string,
    opts: BaseOptions,
  ): Promise<PathQuery | undefined> {
    const { db, referenceSample } = await this.graph(opts)
    const path = (await db.paths()).find(
      p =>
        p.isIndexed &&
        p.name.sample === referenceSample &&
        p.name.contig === refName,
    )
    return path
      ? {
          sample: path.name.sample,
          contig: refName,
          haplotype: path.name.haplotype,
        }
      : undefined
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
   * for. With a companion that carries anchor rows the reader walks only the
   * wanted haplotypes from the anchor before the window and never names the
   * rest; without them it names every walk and drops the ones the predicate
   * rejects. Either way a cut holds those walks, the reference, and the nodes
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
    const { db, anchor } = await this.graph()
    const { assemblyName, refName, start, end } = region
    if (assemblyName !== anchor) {
      throw new HaplotypeWindowError(assemblyName, anchor)
    }
    const query = await this.referenceQuery(refName, {})
    const nodeLimit: number = this.getConf('nodeLimit')
    const keep = this.keepPredicate(opts.haplotypes)
    const subgraph = query
      ? await db
          .getSubgraphForRange(query, start, end, {
            context: this.getConf('context'),
            snarls: this.getConf('subgraphSnarls'),
            haplotypes: 'all',
            limit: nodeLimit,
            signal: opts.signal,
            ...(keep === undefined ? {} : { keep }),
          })
          .catch((error: unknown) => {
            throw nodeLimitError(error, nodeLimit, end - start) ?? error
          })
      : undefined
    return subgraph ? subgraph.toGFA({ names: 'resolved' }) : ''
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
              .getAlignmentsForRange(query, start, end, {
                context: this.getConf('context'),
                haplotypes: 'all',
                limit: nodeLimit,
                signal: opts.signal,
                ...(keep === undefined ? {} : { keep }),
              })
              .catch((error: unknown) => {
                throw nodeLimitError(error, nodeLimit, end - start) ?? error
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

  getFeatures(region: Region, opts: GbzFeatureOptions = {}) {
    return ObservableCreate<Feature>(async observer => {
      const { db, anchor } = await this.graph(opts)
      if (!db.hasHaplotypeIndex) {
        throw new NoHaplotypeIndexError()
      }
      // the graph is indexed on its reference alone, so a window on a
      // haplotype lane has no answer
      if (region.assemblyName === anchor) {
        const features = await this.anchorFeatures(region, opts)
        for (const feature of features) {
          observer.next(feature)
        }
      }
      observer.complete()
    }, opts.signal)
  }
}
