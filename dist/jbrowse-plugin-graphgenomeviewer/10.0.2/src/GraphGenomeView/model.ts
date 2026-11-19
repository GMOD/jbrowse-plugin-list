import { sameInkOnPane } from '@jbrowse/bandage-core/drawnInk'
import { drawnMarks, graphKey } from '@jbrowse/bandage-core/graphKey'
import { layoutLabels } from '@jbrowse/bandage-core/labelLayout'
import { passLabelCandidates } from '@jbrowse/bandage-core/passLabels'
import { keyedView } from '@jbrowse/bandage-core/viewport'
import { getRpcSessionId, getSession } from '@jbrowse/core/util'
import { addDisposer, isAlive } from '@jbrowse/mobx-state-tree'
import { computed, reaction, untracked } from 'mobx'

import {
  configHaplotypes,
  graphReferenceAssembly,
  offReferenceProblem,
  walkIndexed,
} from '../graphTrackConfig'
import { canonicalAssemblyName } from '../launchFromGraph/launchFromGraph'
import { withLaunchActions } from './pane/launchActions'
import { VIEWPORT_DEBOUNCE_MS } from './pane/paneBase'

import type { SubgraphCutOptions, SubgraphRegion } from '../GetSubgraph'
import type { PaneLayout } from './tubeMapPanels'
import type { GraphKey, GraphKeyEntry } from '@jbrowse/bandage-core/graphKey'
import type { LabelLayout } from '@jbrowse/bandage-core/labelLayout'
import type { Bounds } from '@jbrowse/bandage-core/pipeline'
import type { Instance } from '@jbrowse/mobx-state-tree'

export { MAX_GRAPH_REGION_BP, fileName, formatSpanBp } from './pane/paneBase'

const NO_LABELS: LabelLayout = {
  bubbles: [],
  ticks: [],
  genes: [],
  passes: [],
  sizes: [],
}

const sameBounds = (a: Bounds, b: Bounds) =>
  a.minX === b.minX &&
  a.maxX === b.maxX &&
  a.minY === b.minY &&
  a.maxY === b.maxY

const sameEntry = (a: GraphKeyEntry, b: GraphKeyEntry | undefined) =>
  !!b &&
  a.key === b.key &&
  a.text === b.text &&
  a.strong === b.strong &&
  a.under === b.under &&
  a.hover === b.hover &&
  a.walk === b.walk &&
  JSON.stringify(a.swatch) === JSON.stringify(b.swatch)

const sameKey = (a: GraphKey, b: GraphKey) =>
  a.length === b.length &&
  a.every((section, i) => {
    const other = b[i]
    return (
      !!other &&
      section.id === other.id &&
      section.group === other.group &&
      section.entries.length === other.entries.length &&
      section.entries.every((entry, j) => sameEntry(entry, other.entries[j]))
    )
  })

// The pane every graph drawing is: a view of its own, or a display inside a
// linear view. Built in stages under pane/, each extending the one before,
// and given here the cut options both hosts share.
export const GraphPane = withLaunchActions
  // The view the key keys, set once a pan or zoom has settled (afterAttach),
  // so the key, and the labels that wait on its measure, hold still through a
  // gesture. Until one is set on the drawing's layout, the pane's view as it
  // is.
  .volatile(() => ({
    settledKeyView: undefined as
      { view: Bounds; layout: PaneLayout | undefined } | undefined,
  }))
  .actions(self => ({
    setSettledKeyView(view: Bounds) {
      self.settledKeyView = { view, layout: self.layoutResult }
    },
  }))
  .views(self => ({
    get liveKeyView() {
      return keyedView(self, self.axisScale, {
        paneWidth: self.drawingClip ? self.drawingWidth : self.paneWidth,
        canvasHeight: self.canvasHeight,
        referenceStripZonePx: self.referenceStripZonePx,
      })
    },
    get keyView() {
      const settled = self.settledKeyView
      return settled && settled.layout === self.layoutResult
        ? settled.view
        : this.liveKeyView
    },
  }))
  // bandage-core's key for the graph on screen, which the legend and the
  // facet key draw: of the drawing the pane shows beside the key, or of
  // every facet panel's whole. A view that brings no mark in or out leaves it
  // as it was.
  .views(self => {
    const key = computed(
      () => {
        const graph = self.drawnGraph
        const drawings = self.facetDrawings
        return graph
          ? graphKey(graph, self.layoutResult ?? {}, {
              region: self.graphRegion,
              referenceRamp: self.referenceRamp,
              lift: self.walkLift,
              panels: self.facetPanels,
              walkLabel: name => self.walkLabel(name),
              nodeWidth: self.nodeWidth,
              contigThickness: self.contigThickness,
              edgeWidth: self.linkWidth,
              connectorThickness: self.connectorThickness,
              drawsNodes: self.drawsNodes,
              marks: drawings
                ? drawnMarks(
                    drawings.flatMap(drawing =>
                      drawing ? [drawing.batch] : [],
                    ),
                  )
                : drawnMarks([self.settledBatch], self.keyView),
              genePins: self.genePins,
              halos: self.bubbleHalos,
              stripOverhangs: self.referenceStripOverhangs || self.runsPastEdge,
              unlabelled: self.labelsNodeSizes ? 'reserved' : undefined,
            })
          : []
      },
      { equals: sameKey },
    )
    return {
      get graphKey() {
        return key.get()
      },
    }
  })
  // Each lifted walk's passes named on the graph, which the labels place
  // with the rest; a faceted pane names none
  .views(self => ({
    get passLabels() {
      return !self.facetPanels &&
        self.walkLift?.walks.some(walk => walk.walkPasses)
        ? passLabelCandidates(
            self.drawnBatch,
            self.walkLift,
            self.screenTransform,
            { width: self.paneWidth, height: self.canvasHeight },
          )
        : []
    },
  }))
  // The pane's batch as the labels read its ink: a rebuild that paints the
  // same ink on the pane, as the one after a settled fit or a pan does, is
  // not news to them, so it does not lay them out again
  .views(self => {
    const inkOnPane = computed(() => self.drawnBatch, {
      equals: (a, b) =>
        untracked(() =>
          sameInkOnPane(a, b, {
            ...self.screenTransform,
            width: self.paneWidth,
            height: self.canvasHeight,
          }),
        ),
    })
    return {
      get drawnInk() {
        inkOnPane.get()
        return untracked(() => self.drawnBatch)
      },
    }
  })
  // The labels, placed once the frame is settled (labelFrameSettled)
  .views(self => ({
    get overlayLabels() {
      return self.labelFrameSettled ? layoutLabels(self) : NO_LABELS
    },
  }))
  .views(self => ({
    // the config's defaultHaplotypes, which a cut is for until the user
    // picks others
    get trackHaplotypes(): string[] | undefined {
      const adapter = self.sourceAdapter
      return adapter && configHaplotypes(adapter)
    },
  }))
  .views(self => ({
    get cutHaplotypes() {
      return self.subgraphHaplotypes ?? self.trackHaplotypes
    },
    // Why the source track cannot cut `region`, which is a window on an
    // assembly other than the graph's reference. A track may name its
    // reference by an alias of the assembly the window is on.
    offReference(region: SubgraphRegion) {
      const track = self.sourceTrack
      const reference = track && graphReferenceAssembly(track)
      const session = getSession(self)
      return reference === undefined
        ? undefined
        : offReferenceProblem(
            canonicalAssemblyName(session, reference),
            canonicalAssemblyName(session, region.assemblyName),
          )
    },
  }))
  .views(self => ({
    get cutOptions(): SubgraphCutOptions {
      return {
        hops: self.subgraphContext,
        haplotypes: self.cutHaplotypes,
        ...(self.chosenLayoutMode === 'walkrows' ? { walkRows: true } : {}),
        ...(self.cutsWholeWalks ? { snarls: 'overlapping' as const } : {}),
        ...(self.expandedWalks.length > 0
          ? { expand: self.expandedWalks }
          : {}),
        ...(self.forcedByteBudget
          ? { forcedByteBudget: self.forcedByteBudget }
          : {}),
      }
    },
  }))
  .views(self => ({
    get cutKey() {
      return JSON.stringify(self.cutOptions)
    },
  }))
  .views(self => ({
    get cutStale() {
      return (
        self.cutKeyOnRecord !== undefined && self.cutKeyOnRecord !== self.cutKey
      )
    },
  }))
  .actions(self => ({
    markCut() {
      self.cutKeyOnRecord = self.cutKey
    },
    setSubgraphContext(hops: number) {
      self.subgraphContext = hops
    },
    setSubgraphHaplotypes(haplotypes: string[] | undefined) {
      self.subgraphHaplotypes = haplotypes
    },
    setHaplotypeNames(names: string[] | undefined) {
      self.haplotypeNames = names
    },
  }))
  .actions(self => ({
    // A failed read leaves the picker taking typed names
    async fetchHaplotypeNames(
      adapterConfig: Record<string, unknown>,
      signal?: AbortSignal,
    ) {
      try {
        const names = await getSession(self).rpcManager.call(
          getRpcSessionId(self),
          'GetGraphHaplotypes',
          // eslint-disable-next-line no-restricted-syntax -- a background read for the haplotype picker, which has no status line; the pane's belongs to the cut
          { adapterConfig, signal },
        )
        if (isAlive(self) && !signal?.aborted) {
          self.setHaplotypeNames(names)
        }
      } catch (e) {
        if (!signal?.aborted) {
          console.warn('[GraphGenomeView] no haplotype names', e)
        }
      }
    },
  }))
  .actions(self => ({
    afterAttach() {
      let namesRead: AbortController | undefined
      addDisposer(self, () => {
        namesRead?.abort()
      })
      addDisposer(
        self,
        reaction(
          () => {
            const adapter = self.sourceAdapter
            return adapter && walkIndexed(adapter) ? adapter : undefined
          },
          adapterConfig => {
            namesRead?.abort()
            namesRead = undefined
            self.setHaplotypeNames(undefined)
            if (adapterConfig) {
              namesRead = new AbortController()
              void self.fetchHaplotypeNames(adapterConfig, namesRead.signal)
            }
          },
          {
            fireImmediately: true,
            // a lane adapter's config is rebuilt whenever an assembly is
            // added, which would drop and re-read the names
            equals: (a, b) => JSON.stringify(a) === JSON.stringify(b),
            name: 'GraphHaplotypeNames',
          },
        ),
      )
      addDisposer(
        self,
        reaction(
          () => self.liveKeyView,
          view => {
            self.setSettledKeyView(view)
          },
          {
            delay: VIEWPORT_DEBOUNCE_MS,
            fireImmediately: true,
            equals: sameBounds,
            name: 'GraphKeyView',
          },
        ),
      )
      // The key's frame holds from the moment the view the key keys moves,
      // or the drawing is rebuilt for a moved view, until the key changes
      // with neither, as a setting changes it, or a new layout or pane width
      // comes
      addDisposer(
        self,
        reaction(
          () => ({
            shape: self.keyShape,
            view: self.keyView,
            rebuilt: self.builtViewport?.viewportDirty,
            layout: self.layoutResult,
            width: self.paneWidth,
            owner: self.viewportOwner,
          }),
          (now, was) => {
            const moved =
              !sameBounds(now.view, was.view) || now.rebuilt !== was.rebuilt
            self.setKeyFrameHeld(
              now.owner !== 'fit' &&
                now.layout === was.layout &&
                now.width === was.width &&
                (moved || (now.shape === was.shape && self.keyFrameHeld)),
            )
          },
          { name: 'GraphKeyFrame' },
        ),
      )
      // A cut option changed by anything cuts again: a setting, the config
      // editor, undo or a session delta. A change of layout mode cuts through
      // relayout.
      addDisposer(
        self,
        reaction(
          () => ({ mode: self.chosenLayoutMode, key: self.cutKey }),
          (now, was) => {
            if (now.mode === was.mode && self.cutStale) {
              self.retryLoad()
            }
          },
          {
            equals: (a, b) => a.mode === b.mode && a.key === b.key,
            name: 'GraphCutOptions',
          },
        ),
      )
    },
  }))

export type GraphPaneModel = Instance<typeof GraphPane>
