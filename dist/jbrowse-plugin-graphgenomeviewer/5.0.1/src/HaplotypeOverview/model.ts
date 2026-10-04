import { getRpcSessionId, getSession } from '@jbrowse/core/util'
import { flow, types } from '@jbrowse/mobx-state-tree'

import { FINE_BIN_BP, densityCounts } from './draw'
import { cutHolds, hostCut } from '../GraphGenomeView/host'

import type { HaplotypeOverviewData } from '../GetHaplotypeOverview'
import type { SubgraphRegion } from '../GetSubgraph'
import type { HostWindow } from '../GraphGenomeView/host'

// A cut refused for its node count: the GBZ adapter's own error, or
// gbz-base's when it reaches the display unwrapped
export function isNodeLimitError(error: unknown) {
  return (
    error instanceof Error &&
    (error.name === 'NodeLimitError' ||
      /reads more than nodeLimit|^Subgraph size limit of \d+ nodes exceeded/.test(
        error.message,
      ))
  )
}

// Where a cut came back over its node limit. The graph is as dense as that
// only near it, so it stands for windows as wide or wider on the same contig
// within one window-width of it.
export interface DenseWindow {
  refName: string
  assemblyName: string
  start: number
  end: number
}

export function denseCovers(dense: DenseWindow | undefined, seen: HostWindow) {
  if (
    dense?.refName !== seen.refName ||
    dense.assemblyName !== seen.assemblyName
  ) {
    return false
  }
  const span = dense.end - dense.start
  return (
    seen.end - seen.start >= span &&
    seen.end > dense.start - span &&
    seen.start < dense.end + span
  )
}

export class NoOverviewError extends Error {
  override name = 'NoOverviewError'

  constructor() {
    super(
      'this window is too large to cut, and there is no overview to draw instead: either the haplotype index has none (rebuild it with gbz-haplotype-index 0.3 or later) or the reference has no path by this name. Zoom in to see the graph',
    )
  }
}

// What a GBZ track draws once its window is too large to cut: the haplotype
// index's overview of the window plus one window-width each side, refetched
// once the window leaves it or the zoom moves a level.
export function HaplotypeOverviewMixin() {
  return types
    .model({
      // every haplotype as a row, or only the lanes the track names; unset
      // is every haplotype, and keeps the key out of snapshots
      overviewRowsChoice: types.maybe(types.boolean),
    })
    .volatile(() => ({
      overview: undefined as HaplotypeOverviewData | undefined,
      overviewRegion: undefined as SubgraphRegion | undefined,
      overviewBpPerPx: 0,
      overviewLoading: false,
      overviewError: undefined as Error | undefined,
      overviewPainted: undefined as HaplotypeOverviewData | undefined,
      overviewController: undefined as AbortController | undefined,
      dense: undefined as DenseWindow | undefined,
    }))
    .views(self => ({
      get overviewAllRows() {
        return self.overviewRowsChoice ?? true
      },
      // per bin, the density band's class counts; past FINE_BIN_BP the band
      // reads the bins' excursion counts instead
      get overviewCounts() {
        return self.overview && self.overview.bin <= FINE_BIN_BP
          ? densityCounts(self.overview)
          : undefined
      },
      overviewHolds(seen: HostWindow) {
        return (
          self.overview !== undefined &&
          self.overviewError === undefined &&
          cutHolds(self.overviewRegion, seen) &&
          seen.bpPerPx >= self.overviewBpPerPx / 2 &&
          seen.bpPerPx <= self.overviewBpPerPx * 2
        )
      },
    }))
    .actions(self => ({
      setOverviewAllRows(all: boolean) {
        self.overviewRowsChoice = all
      },
      beforeDestroy() {
        self.overviewController?.abort()
      },
      setOverviewPainted(data: HaplotypeOverviewData) {
        self.overviewPainted = data
      },
      setDense(window: DenseWindow | undefined) {
        self.dense = window
      },
      forgetOverview() {
        self.overviewController?.abort()
        self.overview = undefined
        self.overviewRegion = undefined
        self.overviewLoading = false
      },
      fetchOverview: flow(function* (
        adapterConfig: Record<string, unknown>,
        seen: HostWindow,
        haplotypes: string[] | undefined,
      ) {
        self.overviewController?.abort()
        const controller = new AbortController()
        self.overviewController = controller
        self.overviewLoading = true
        self.overviewError = undefined
        const region = hostCut(seen, Infinity)
        try {
          const data = (yield getSession(self).rpcManager.call(
            getRpcSessionId(self),
            'GetHaplotypeOverview',
            {
              adapterConfig,
              region,
              // a level coarser than one bin per pixel, so a row image is
              // at most a few times the window's width
              bpPerPx: seen.bpPerPx * 2,
              haplotypes,
              signal: controller.signal,
            },
          )) as HaplotypeOverviewData | undefined
          if (!controller.signal.aborted) {
            self.overview = data
            self.overviewRegion = region
            self.overviewBpPerPx = seen.bpPerPx
            if (!data) {
              self.overviewError = new NoOverviewError()
            }
          }
        } catch (e) {
          if (!controller.signal.aborted) {
            console.error('[HaplotypeOverview]', e)
            self.overviewError = e instanceof Error ? e : new Error(String(e))
          }
        } finally {
          if (self.overviewController === controller) {
            self.overviewLoading = false
          }
        }
      }),
    }))
}
