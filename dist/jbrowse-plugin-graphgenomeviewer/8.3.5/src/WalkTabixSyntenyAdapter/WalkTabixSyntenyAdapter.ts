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
import { walksKept } from '@jbrowse/graph-walks'

import {
  anchorAligner,
  chainFeature,
  crossingFeature,
  crossingSide,
  lanePairAligner,
  skipCrossing,
  walkSide,
} from './walkLanes.ts'
import { WalkIndex } from '../RgfaTabixAdapter/walkReader.ts'
import { PanSNRefNames, openTabixSlot } from '../panSNTabix.ts'
import { ComparativeAdapterBase } from '../synteny/ComparativeAdapterBase.ts'
import {
  laneAssemblyName,
  lanePairsStatus,
  requestedPairs,
} from '../synteny/lanePairs.ts'
import { laneZoomNotice } from '../synteny/laneZoomNotice.ts'

import type { WalkTabixSyntenyAdapterConfig } from './configSchema.ts'
import type { SubgraphAdapterOptions } from '../GetSubgraph.ts'
import type { LaneFeatureOptions, LanePair } from '../synteny/lanePairs.ts'
import type { MatchSide } from '../synteny/matchFeature.ts'
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter'
import type { Feature } from '@jbrowse/core/util'
import type { Region } from '@jbrowse/core/util/types'
import type { WalkSkip } from '@jbrowse/graph-walks'

const haplotypeOf = ({ name }: { name: string }) => panSNHaplotype(name) ?? name

export default class WalkTabixSyntenyAdapter extends ComparativeAdapterBase<WalkTabixSyntenyAdapterConfig> {
  private readonly walks: WalkIndex = new WalkIndex(
    openTabixSlot(this, ['walksLocation'], ['walksIndex']),
    this,
  )
  private readonly refNames: PanSNRefNames = new PanSNRefNames(
    this.walks.file,
    this,
  )

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
    return this.walks.haplotypeNames(opts)
  }

  /**
   * `lanes` is every haplotype the header names but the anchor's own,
   * declared up front so the display can offer the whole graph's haplotypes
   * before a fetch has placed any of them
   */
  async getHeader(opts: BaseOptions = {}) {
    const { haplotypes } = await this.walks.reader.header(opts)
    const { anchor } = this
    const anchorPrefix = resolvePanSNPrefix(this, anchor)
    const asmByPrefix = assemblyByPanSNPrefix(this)
    return {
      hasCoarseTier: false,
      anchorAssemblyName: anchor,
      lanes: haplotypes
        .filter(
          prefix =>
            prefix !== anchorPrefix && panSNSample(prefix) !== anchorPrefix,
        )
        .map(prefix => ({
          name: laneAssemblyName(asmByPrefix, prefix),
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

  /**
   * The graph display's cut of the window, as RgfaTabixAdapter cuts a
   * walk-indexed graph: the reference walk first, then the walks `haplotypes`
   * asks for, and the nodes and links they visit
   */
  async getSubgraph(region: Region, opts: SubgraphAdapterOptions = {}) {
    const refName = await this.refNames.resolveForCut(region, {
      signal: opts.signal,
    })
    return this.walks.subgraph(refName, region, opts)
  }

  // The window's walks for the haplotypes named and the reference, with no
  // link read; a window past a budget fails as a zoom-in notice for lanes.
  // Named lanes come back in full where format 5 abridged them: an abridged
  // walk is two reference steps, which drew 15 of the HPRC MHC launch's 32
  // lanes empty.
  private async laneWalks(
    refName: string,
    region: Region,
    prefixes: string[] | undefined,
    opts: LaneFeatureOptions,
    status: string,
  ) {
    const keep = walksKept(prefixes, refName)
    return updateStatus(status, opts.statusCallback, () =>
      this.walks.reader
        .cut(refName, region, {
          ...this.walks.budgets(),
          signal: opts.signal,
          keep,
          expand: keep,
          links: false,
        })
        .catch((error: unknown) => {
          throw laneZoomNotice(error, region.end - region.start)
        }),
    )
  }

  /**
   * Where each haplotype that skips the window crosses its deletion, read
   * from cuts over the reference nodes they leave at, one cut per chunk those
   * nodes fall in. A haplotype with a walk in the window draws that instead:
   * NA19036#1 skips the IGL locus on one contig and walks it on another.
   */
  private async skipCrossings(
    refName: string,
    { skips, fragments }: { skips: WalkSkip[]; fragments: { name: string }[] },
    opts: LaneFeatureOptions,
  ) {
    const { signal } = opts
    const walked = new Set(fragments.map(haplotypeOf))
    const crossing = skips.filter(skip => !walked.has(haplotypeOf(skip)))
    const { chunk } = await this.walks.reader.header({ signal })
    const byChunk = new Map<
      number,
      { group: WalkSkip[]; start: number; end: number }
    >()
    for (const skip of crossing) {
      const cs = Math.floor((skip.refStart - 1) / chunk)
      const held = byChunk.get(cs)
      if (held) {
        held.group.push(skip)
        held.start = Math.min(held.start, skip.refStart - 1)
        held.end = Math.max(held.end, skip.refStart)
      } else {
        byChunk.set(cs, {
          group: [skip],
          start: skip.refStart - 1,
          end: skip.refStart,
        })
      }
    }
    const found = await Promise.all(
      [...byChunk.values()].map(async ({ group, start, end }) => {
        const names = new Set(group.map(skip => skip.name))
        const keep = (name: string) => names.has(name)
        const { graph, fragments } = await this.walks.reader.cut(
          refName,
          { start, end },
          { signal, keep, expand: keep, context: 0, links: false },
        )
        return group.map(skip =>
          skipCrossing(skip, refName, fragments, graph.nodes),
        )
      }),
    )
    return found.flat().filter(crossing => crossing !== undefined)
  }

  /**
   * One record per stretch a haplotype's walk shares with the reference's,
   * on the reference with the haplotype as its mate. A haplotype whose
   * deletion spans the window is one record of the skipped stretch, its mate
   * the point where the haplotype crosses the deletion.
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
    const status = `Reading walks ${region.refName}:${start.toLocaleString()}-${end.toLocaleString()}`
    const { graph, fragments, skips } = await this.laneWalks(
      refName,
      region,
      prefixes,
      opts,
      status,
    )
    // lanes come back in the order the fetch names them, which is the order
    // the display stacks lanes of equal weight in
    const rank = ({ name }: { name: string }) =>
      prefixes === undefined
        ? 0
        : prefixes.findIndex(prefix => panSNMatchesPrefix(name, prefix))
    const crossings = await updateStatus(status, opts.statusCallback, () =>
      this.skipCrossings(
        refName,
        { skips: skips.filter(skip => rank(skip) >= 0), fragments },
        opts,
      ),
    )
    const align = anchorAligner(graph.nodes)
    const asmByPrefix = assemblyByPanSNPrefix(this)
    const laneOf = (walk: { name: string }) =>
      laneAssemblyName(asmByPrefix, haplotypeOf(walk))
    const references = fragments.filter(f => f.name === refName)
    const walked = fragments
      .filter(fragment => fragment.name !== refName && rank(fragment) >= 0)
      .map(query => ({
        rank: rank(query),
        features: references.flatMap(reference =>
          align(query, reference).map(chain =>
            chainFeature({
              chain,
              target: reference,
              query,
              assemblyName: region.assemblyName,
              refName: region.refName,
              mateAssemblyName: laneOf(query),
            }),
          ),
        ),
      }))
    const skipped = crossings.map(crossing => {
      const { skip } = crossing
      return {
        rank: rank(skip),
        features: [
          crossingFeature({
            target: {
              name: refName,
              assemblyName: region.assemblyName,
              refName: region.refName,
              start: skip.refStart,
              end: skip.refEnd,
            },
            query: crossingSide(crossing, laneOf(skip)),
            strand: crossing.strand,
          }),
        ],
      }
    })
    return [...walked, ...skipped]
      .sort((a, b) => a.rank - b.rank)
      .flatMap(lane => lane.features)
  }

  /**
   * Each pair's two lanes read out of the anchor window, all pairs in one
   * read, and each walk of a pair's query lane aligned to each walk of its
   * target lane. A pair's records sit on its query lane's contigs, the lane
   * the display draws on top. A lane that skips the window pairs as the
   * point where it crosses its deletion.
   */
  private async pairFeatures(
    refName: string,
    region: Region,
    pairs: LanePair[],
    opts: LaneFeatureOptions,
  ) {
    const sides = pairs.map(pair => ({
      pair,
      featurePrefix: resolvePanSNPrefix(this, pair.queryAssemblyName),
      matePrefix: resolvePanSNPrefix(this, pair.targetAssemblyName),
    }))
    const status = lanePairsStatus(pairs)
    const { graph, fragments, skips } = await this.laneWalks(
      refName,
      region,
      sides.flatMap(side => [side.featurePrefix, side.matePrefix]),
      opts,
      status,
    )
    const crossings = await updateStatus(status, opts.statusCallback, () =>
      this.skipCrossings(refName, { skips, fragments }, opts),
    )
    const align = lanePairAligner(graph.nodes)
    const walksOf = (prefix: string) =>
      fragments.filter(f => panSNMatchesPrefix(f.name, prefix))
    const walkSides = (prefix: string, assemblyName: string) =>
      walksOf(prefix).map(walk => walkSide(walk, assemblyName))
    const crossingSides = (prefix: string, assemblyName: string) =>
      crossings
        .filter(({ skip }) => panSNMatchesPrefix(skip.name, prefix))
        .map(crossing => crossingSide(crossing, assemblyName))
    const crossed = (own: MatchSide[], mates: MatchSide[]) =>
      own.flatMap(target =>
        mates.map(query => crossingFeature({ target, query, strand: '+' })),
      )
    return sides.flatMap(({ pair, featurePrefix, matePrefix }) => {
      const { queryAssemblyName, targetAssemblyName } = pair
      return [
        ...walksOf(featurePrefix).flatMap(target =>
          walksOf(matePrefix).flatMap(query =>
            align(query, target).map(chain =>
              chainFeature({
                chain,
                target,
                query,
                assemblyName: queryAssemblyName,
                refName: panSNContig(target.name),
                mateAssemblyName: targetAssemblyName,
              }),
            ),
          ),
        ),
        ...crossed(
          walkSides(featurePrefix, queryAssemblyName),
          crossingSides(matePrefix, targetAssemblyName),
        ),
        ...crossed(
          crossingSides(featurePrefix, queryAssemblyName),
          walkSides(matePrefix, targetAssemblyName),
        ),
      ]
    })
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
