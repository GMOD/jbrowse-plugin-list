import { BaseFeatureDataAdapter } from '@jbrowse/core/data_adapters/BaseAdapter'
import { SimpleFeature, updateStatus } from '@jbrowse/core/util'
import { ObservableCreate } from '@jbrowse/core/util/rxjs'

import { PanSNRefNames, openTabixSlot } from '../panSNTabix.ts'
import {
  bubbleDescription,
  bubbleLabel,
  parseBubbleLine,
} from './bubbleLine.ts'

import type { MinigraphBubbleAdapterConfig } from './configSchema.ts'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { BaseOptions } from '@jbrowse/core/data_adapters/BaseAdapter'
import type { getSubAdapterType } from '@jbrowse/core/data_adapters/dataAdapterCache'
import type { Feature } from '@jbrowse/core/util'
import type { Region } from '@jbrowse/core/util/types'

export default class MinigraphBubbleAdapter extends BaseFeatureDataAdapter<MinigraphBubbleAdapterConfig> {
  public static capabilities = ['getFeatures', 'getRefNames']

  private readonly bubbles
  // `gfatools bubble` names each row after the graph's stable sequence, so a
  // Minigraph-Cactus graph produces PanSN rows (`GRCh38#0#chr6`) where a plain
  // minigraph graph produces bare ones (`chr6`). Same resolution the segment
  // adapter does, through the same `assemblyNameToPanSN` slot.
  private readonly refNames

  public constructor(
    config: MinigraphBubbleAdapterConfig,
    getSubAdapter?: getSubAdapterType,
    pluginManager?: PluginManager,
  ) {
    super(config, getSubAdapter, pluginManager)
    this.bubbles = openTabixSlot(this, ['bubblesLocation'], ['index'])
    this.refNames = new PanSNRefNames(this.bubbles, this)
  }

  async getRefNames(opts: BaseOptions = {}) {
    return this.refNames.assemblyRefNames(opts)
  }

  public async hasDataForRefName() {
    return true
  }

  getFeatures(query: Region, opts: BaseOptions = {}) {
    const { signal, statusCallback } = opts
    return ObservableCreate<Feature>(async observer => {
      const tabixRefName = await this.refNames.resolve(query, opts)
      if (tabixRefName !== undefined) {
        await updateStatus('Downloading bubbles', statusCallback, () =>
          this.bubbles.getLines(tabixRefName, query.start, query.end, {
            signal,
            lineCallback: (line, fileOffset) => {
              const bubble = parseBubbleLine(line)
              observer.next(
                new SimpleFeature({
                  uniqueId: `bubble-${fileOffset}`,
                  refName: query.refName,
                  start: bubble.start,
                  end: bubble.end,
                  // How variable this spot is, in two words, since that is the
                  // whole point of the track.
                  name: bubbleLabel(bubble),
                  description: bubbleDescription(bubble),
                  type: 'bubble',
                  score: bubble.segmentCount,
                  segmentCount: bubble.segmentCount,
                  pathCount: bubble.pathCount,
                  inversion: bubble.inversion,
                  shortestAlleleLength: bubble.shortestAlleleLength,
                  longestAlleleLength: bubble.longestAlleleLength,
                  segments: bubble.segments,
                  shortestAllele: bubble.shortestAllele,
                  longestAllele: bubble.longestAllele,
                }),
              )
            },
          }),
        )
      }
      observer.complete()
    }, signal)
  }
}
