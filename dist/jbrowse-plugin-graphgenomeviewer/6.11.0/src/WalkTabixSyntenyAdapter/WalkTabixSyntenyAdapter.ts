import { NodeLimitError } from '@jbrowse/bandage-core/gbzWindow'
import {
  assemblyByPanSNPrefix,
  panSNContig,
  panSNHaplotype,
  panSNMatchesPrefix,
  panSNSample,
  resolvePanSNPrefix,
} from '@jbrowse/bandage-core/pansn'
import { updateStatus } from '@jbrowse/core/util'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'

import { chainFeature, walkAligner } from './walkLanes.ts'
import { WalkReader } from '../RgfaTabixAdapter/walkReader.ts'
import { walkNameFilter } from '../RgfaTabixAdapter/walkRows.ts'
import { PanSNRefNames, openTabixSlot } from '../panSNTabix.ts'
import { ComparativeAdapterBase } from '../synteny/ComparativeAdapterBase.ts'
import { requestedPairs } from '../synteny/lanePairs.ts'

import type { WalkTabixSyntenyAdapterConfig } from './configSchema.ts'
import type { SubgraphAdapterOptions } from '../GetSubgraph.ts'
import type { WalkFragment } from '../RgfaTabixAdapter/walkRows.ts'
import type { LaneFeatureOptions, LanePair } from '../synteny/lanePairs.ts'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter'
import type { getSubAdapterType } from '@jbrowse/core/data_adapters/dataAdapterCache'
import type { Feature } from '@jbrowse/core/util'
import type { Region } from '@jbrowse/core/util/types'

// How much graph a cut keeps around the window, on the reference
const WALK_CONTEXT = 1000

/**
 * The lane a haplotype draws on: the JBrowse assembly the config maps to it at
 * haplotype or sample depth, else its own PanSN prefix
 */
export function laneOf(asmByPrefix: Record<string, string>, prefix: string) {
  return asmByPrefix[prefix] ?? asmByPrefix[panSNSample(prefix)] ?? prefix
}

const haplotypeOf = (fragment: WalkFragment) =>
  panSNHaplotype(fragment.name) ?? fragment.name

export default class WalkTabixSyntenyAdapter extends ComparativeAdapterBase<WalkTabixSyntenyAdapterConfig> {
  private readonly reader
  private readonly refNames

  public constructor(
    config: WalkTabixSyntenyAdapterConfig,
    getSubAdapter?: getSubAdapterType,
    pluginManager?: PluginManager,
  ) {
    super(config, getSubAdapter, pluginManager)
    const nodes = openTabixSlot(this, ['nodesLocation'], ['nodesIndex'])
    this.reader = new WalkReader(
      {
        walks: openTabixSlot(this, ['walksLocation'], ['walksIndex']),
        nodes,
        links: openTabixSlot(this, ['linksLocation'], ['linksIndex']),
      },
      this.getConf('walkChunk'),
    )
    this.refNames = new PanSNRefNames(nodes, this)
  }

  private get anchor() {
    const anchor = this.getConf('assemblyNames')[0]
    if (anchor === undefined) {
      throw new Error(
        'WalkTabixSyntenyAdapter needs assemblyNames: its first entry is the assembly the reference sample is loaded as',
      )
    }
    return anchor
  }

  /**
   * The haplotypes the walk file's header names, `sample#haplotype` in byte
   * order, or undefined when it names none
   */
  async getHaplotypeNames(opts: BaseOptions = {}) {
    const { haplotypes } = await this.reader.header(opts)
    return haplotypes.length > 0 ? haplotypes : undefined
  }

  /**
   * `lanes` is every haplotype the header names but the anchor's own,
   * declared up front so the display can offer the whole graph's haplotypes
   * before a fetch has placed any of them
   */
  async getHeader(opts: BaseOptions = {}) {
    const { haplotypes, references } = await this.reader.header(opts)
    const { anchor } = this
    const anchorPrefix = resolvePanSNPrefix(this, anchor)
    const asmByPrefix = assemblyByPanSNPrefix(this)
    return {
      hasCoarseTier: false,
      anchorAssemblyName: anchor,
      referenceSamples: references,
      lanes: haplotypes
        .filter(
          prefix =>
            prefix !== anchorPrefix && panSNSample(prefix) !== anchorPrefix,
        )
        .map(prefix => ({
          name: laneOf(asmByPrefix, prefix),
          label: prefix,
          group: panSNSample(prefix),
        })),
    }
  }

  // A lane's contigs are named only in its walk rows, so only the anchor's
  // are listed
  async getRefNames(opts: BaseOptions = {}) {
    const { assemblyName } = opts
    return assemblyName === undefined || assemblyName === this.anchor
      ? this.refNames.assemblyRefNames({ ...opts, assemblyName: this.anchor })
      : []
  }

  private budgets() {
    return {
      stepBudget: this.getConf('walkStepBudget'),
      byteBudget: this.getConf('walkByteBudget'),
      context: WALK_CONTEXT,
    }
  }

  /**
   * The graph display's cut of the window, as RgfaTabixAdapter cuts a
   * walk-indexed graph: the reference walk first, then the walks `haplotypes`
   * asks for, and the nodes and links they visit
   */
  async getSubgraph(region: Region, opts: SubgraphAdapterOptions = {}) {
    const { signal, haplotypes } = opts
    const refName = await this.refNames.resolve(region, { signal })
    if (refName === undefined) {
      throw new Error(
        `${region.assemblyName} ${region.refName} is not in this graph's index; the graph is cut on ${this.anchor}, mapped to its PanSN prefix in assemblyNameToPanSN`,
      )
    }
    const { graph, kept, fragments } = await this.reader.cut(refName, region, {
      ...this.budgets(),
      signal,
      keep: walkNameFilter(
        haplotypes?.map(lane => resolvePanSNPrefix(this, lane)),
        panSNHaplotype(refName),
      ),
    })
    return graph.tables(kept, fragments)
  }

  // The window's walks for the haplotypes named and the reference, with no
  // link read; a window past a budget fails as a zoom-in notice for lanes
  private async laneWalks(
    refName: string,
    region: Region,
    prefixes: string[] | undefined,
    opts: LaneFeatureOptions,
    status: string,
  ) {
    return updateStatus(status, opts.statusCallback, () =>
      this.reader
        .cut(refName, region, {
          ...this.budgets(),
          signal: opts.signal,
          keep: walkNameFilter(prefixes, panSNHaplotype(refName)),
          links: false,
        })
        .catch((error: unknown) => {
          if (error instanceof NodeLimitError) {
            error.message = error.message.replace(
              'to see the graph',
              'to see lanes',
            )
          }
          throw error
        }),
    )
  }

  /**
   * One record per stretch a haplotype's walk shares with the reference's,
   * on the reference with the haplotype as its mate
   */
  private async anchorFeatures(
    refName: string,
    region: Region,
    opts: LaneFeatureOptions,
  ) {
    const wanted = opts.haplotypes?.length
      ? opts.haplotypes.map(lane => resolvePanSNPrefix(this, lane))
      : undefined
    const target = resolvePanSNPrefix(this, opts.targetAssemblyName)
    const prefixes =
      target === undefined
        ? wanted
        : wanted === undefined ||
            wanted.some(
              prefix =>
                panSNMatchesPrefix(target, prefix) ||
                panSNMatchesPrefix(prefix, target),
            )
          ? [target]
          : []
    if (prefixes?.length === 0) {
      return []
    }
    const { start, end } = region
    const { graph, fragments } = await this.laneWalks(
      refName,
      region,
      prefixes,
      opts,
      `Reading walks ${region.refName}:${start.toLocaleString()}-${end.toLocaleString()}`,
    )
    const align = walkAligner(graph.nodes)
    const asmByPrefix = assemblyByPanSNPrefix(this)
    const references = fragments.filter(f => f.name === refName)
    // lanes come back in the order the fetch names them, which is the order
    // the display stacks lanes of equal weight in
    const rank = (fragment: WalkFragment) =>
      prefixes === undefined
        ? 0
        : prefixes.findIndex(prefix =>
            panSNMatchesPrefix(fragment.name, prefix),
          )
    const shown = fragments
      .filter(fragment => fragment.name !== refName && rank(fragment) >= 0)
      .sort((a, b) => rank(a) - rank(b))
    return shown.flatMap(query =>
      references.flatMap(reference =>
        align(query, reference).map(chain =>
          chainFeature({
            chain,
            target: reference,
            query,
            assemblyName: region.assemblyName,
            refName: region.refName,
            mateAssemblyName: laneOf(asmByPrefix, haplotypeOf(query)),
          }),
        ),
      ),
    )
  }

  /**
   * Each pair's two lanes read out of the anchor window, all pairs in one
   * read, and each walk of a pair's query lane aligned to each walk of its
   * target lane. A pair's records sit on its query lane's contigs, the lane
   * the display draws on top.
   */
  private async pairFeatures(
    refName: string,
    region: Region,
    pairs: LanePair[],
    opts: LaneFeatureOptions,
  ) {
    const [first] = pairs
    const sides = pairs.map(pair => ({
      pair,
      featurePrefix: resolvePanSNPrefix(this, pair.queryAssemblyName),
      matePrefix: resolvePanSNPrefix(this, pair.targetAssemblyName),
    }))
    const { graph, fragments } = await this.laneWalks(
      refName,
      region,
      sides.flatMap(side => [side.featurePrefix, side.matePrefix]),
      opts,
      pairs.length === 1 && first
        ? `Reading ${first.queryAssemblyName} against ${first.targetAssemblyName}`
        : `Reading ${pairs.length} lane pairs`,
    )
    const align = walkAligner(graph.nodes)
    const walksOf = (prefix: string) =>
      fragments.filter(f => panSNMatchesPrefix(f.name, prefix))
    return sides.flatMap(({ pair, featurePrefix, matePrefix }) =>
      walksOf(featurePrefix).flatMap(target =>
        walksOf(matePrefix).flatMap(query =>
          align(query, target).map(chain =>
            chainFeature({
              chain,
              target,
              query,
              assemblyName: pair.queryAssemblyName,
              refName: panSNContig(target.name),
              mateAssemblyName: pair.targetAssemblyName,
            }),
          ),
        ),
      ),
    )
  }

  // The files are filed under the reference alone, so a window on a
  // haplotype lane has no answer: a lane pair is read inside the anchor's
  getFeatures(region: Region, opts: LaneFeatureOptions = {}) {
    return ObservableCreate<Feature>(async observer => {
      const refName =
        region.assemblyName === this.anchor
          ? await this.refNames.resolve(region, opts)
          : undefined
      if (refName !== undefined) {
        const pairs = requestedPairs(opts)
        const features =
          pairs.length > 0
            ? await this.pairFeatures(refName, region, pairs, opts)
            : await this.anchorFeatures(refName, region, opts)
        for (const feature of features) {
          observer.next(feature)
        }
      }
      observer.complete()
    }, opts.signal)
  }
}
