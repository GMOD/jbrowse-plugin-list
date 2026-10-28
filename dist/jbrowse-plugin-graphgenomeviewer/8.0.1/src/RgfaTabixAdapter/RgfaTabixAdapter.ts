import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter'
import { SimpleFeature, updateStatus } from '@jbrowse/core/util'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'
import { parseSegmentRow, rgfaCut, segmentSamples } from '@jbrowse/graph-walks'

import { locationIsSet } from '../locationName.ts'
import { PanSNRefNames, openTabixSlot } from '../panSNTabix.ts'
import { getLines } from '../tabixRange.ts'
import { WalkIndex } from './walkReader.ts'

import type { RgfaTabixAdapterConfig } from './configSchema.ts'
import type { SubgraphAdapterOptions, SubgraphTier } from '../GetSubgraph.ts'
import type { WalkCut } from './walkCut.ts'
import type { TabixIndexedFile } from '@gmod/tabix'
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter'
import type { Feature } from '@jbrowse/core/util'
import type { FileLocation, Region } from '@jbrowse/core/util/types'

interface GraphIndex {
  segments: TabixIndexedFile
  links: TabixIndexedFile
  walks?: WalkIndex
  refNames: PanSNRefNames
}

export default class RgfaTabixAdapter extends BaseFeatureDataAdapter<RgfaTabixAdapterConfig> {
  public static capabilities = ['getFeatures', 'getRefNames']

  private readonly fine = this.openIndex([])
  private coarse: GraphIndex | undefined

  // refNames off the SEGMENT index: it is the one that names every stable
  // sequence the graph is anchored to, where the link index only names those a
  // link touches. A walk-indexed graph's walk file names the same sequences,
  // and it has no segment file.
  private openIndex(under: string[]): GraphIndex {
    const segments = openTabixSlot(
      this,
      [...under, 'segmentsLocation'],
      [...under, 'segmentsIndex'],
    )
    const links = openTabixSlot(
      this,
      [...under, 'linksLocation'],
      [...under, 'linksIndex'],
    )
    const walksLocation: FileLocation = this.getConf('walksLocation')
    const walks =
      under.length === 0 && locationIsSet(walksLocation)
        ? new WalkIndex(
            openTabixSlot(this, ['walksLocation'], ['walksIndex']),
            this,
          )
        : undefined
    return {
      segments,
      links,
      walks,
      refNames: new PanSNRefNames(walks?.file ?? segments, this),
    }
  }

  /**
   * The haplotypes a walk-indexed graph's header names, `sample#haplotype`
   * in byte order, or undefined when it names none
   */
  async getHaplotypeNames(opts: BaseOptions = {}) {
    return this.fine.walks?.haplotypeNames(opts)
  }

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

  // getFeatures reads a walk file from the chunk before the window
  async getRegionByteSize(regions: Region[], opts: BaseOptions = {}) {
    const { walks, refNames } = this.fine
    return refNames.regionBytes(
      regions,
      opts,
      walks &&
        ((refName, { start, end }) =>
          walks.reader.queryStart(start, { ...opts, refName, end })),
    )
  }

  public async hasDataForRefName() {
    return true
  }

  getFeatures(query: Region, opts: BaseOptions = {}) {
    return ObservableCreate<Feature>(async observer => {
      const tabixRefName = await this.fine.refNames.resolveMapped(query, opts)
      if (tabixRefName !== undefined) {
        const { walks } = this.fine
        const emit = (feature: Feature) => {
          observer.next(feature)
        }
        await (walks
          ? this.walkFeatures(walks, tabixRefName, query, opts, emit)
          : this.segmentFeatures(tabixRefName, query, opts, emit))
      }
      observer.complete()
    }, opts.signal)
  }

  // A walk-indexed graph's reference nodes are its ref rows' steps
  private async walkFeatures(
    walks: WalkIndex,
    tabixRefName: string,
    query: Region,
    opts: BaseOptions,
    emit: (feature: Feature) => void,
  ) {
    const nodes = await updateStatus(
      'Downloading walks',
      opts.statusCallback,
      () => walks.referenceNodes(tabixRefName, query, opts),
    )
    for (const node of nodes) {
      const id = String(node.id)
      emit(
        new SimpleFeature({
          uniqueId: id,
          refName: query.refName,
          start: node.start,
          end: node.end,
          name: id,
          type: 'segment',
          rank: 0,
          stableName: node.refName,
        }),
      )
    }
  }

  private async segmentFeatures(
    tabixRefName: string,
    query: Region,
    opts: BaseOptions,
    emit: (feature: Feature) => void,
  ) {
    await updateStatus('Downloading segments', opts.statusCallback, () =>
      getLines(this.fine.segments, tabixRefName, query.start, query.end, {
        signal: opts.signal,
        lineCallback: line => {
          const { segment, anchored } = parseSegmentRow(line)
          // An anchored index also returns the alleles under the region,
          // which lie on other stable sequences and have no place on this one
          if (anchored && segment.refName !== tabixRefName) {
            return
          }
          // `samples` lists the haplotypes whose paths visit the segment and
          // `sampleCount` counts them. A lane's color reads the count, and
          // a count in jexl would otherwise rely on `.length` resolving
          // through a member access on an array.
          const samples = segmentSamples(segment)
          emit(
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

  // The graph around a region for GraphGenomeView: GFA text (rgfaCut), or a
  // walk-indexed graph's tables (WalkIndex.subgraph). `tier: 'coarse'` reads
  // the `coarse` pair instead, the same way.
  async getSubgraph(
    region: Region,
    opts: SubgraphAdapterOptions = {},
  ): Promise<string | WalkCut> {
    const { hops, signal, tier } = opts
    const index = this.index(tier)
    const tabixRefName = await index.refNames.resolveForCut(region, { signal })
    if (index.walks) {
      return index.walks.subgraph(tabixRefName, region, opts)
    }
    return rgfaCut(
      index,
      { refName: tabixRefName, start: region.start, end: region.end },
      { hops, signal },
    )
  }
}
