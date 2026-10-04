import { lazy } from 'react'

import { layoutModeByValue } from '@jbrowse/bandage-core/layoutModes'
import { ConfigurationReference, getConf } from '@jbrowse/core/configuration'
import { BaseDisplay } from '@jbrowse/core/pluggableElementTypes'
import { pushLaunchViewMenuItem } from '@jbrowse/core/ui'
import { getSession } from '@jbrowse/core/util'
import TrackHeightMixin from '@jbrowse/display-kit/TrackHeightMixin'
import {
  addDisposer,
  getSnapshot,
  isAlive,
  types,
} from '@jbrowse/mobx-state-tree'
import {
  computeActivityPhase,
  computeDisplayStatusPhase,
} from '@jbrowse/render-core/displayPhase'
import BubbleChartIcon from '@mui/icons-material/BubbleChart'
import SettingsIcon from '@mui/icons-material/Settings'
import { reaction } from 'mobx'

import { cutHolds, hostCut, hostWindow } from '../GraphGenomeView/host'
import {
  GraphPaneMixin,
  MAX_GRAPH_REGION_BP,
  formatSpanBp,
} from '../GraphGenomeView/model'
import {
  HaplotypeOverviewMixin,
  denseCovers,
  isNodeLimitError,
} from '../HaplotypeOverview/model'
import {
  graphReferenceAssembly,
  offReferenceProblem,
  trackLanes,
} from '../graphTrackConfig'
import { trackAdapterConfig } from '../panSNAliases/trackAdapterConfig'

import type { LinearGraphDisplayConfigModel } from './configSchema'
import type { SubgraphRegion, SubgraphTier } from '../GetSubgraph'
import type { HostWindow } from '../GraphGenomeView/host'
import type { LaunchGraphGenomeViewArgs } from '../LaunchGraphGenomeView'
import type { ColorScheme } from '@jbrowse/bandage-core/colorSchemes'
import type { LayoutModeValue } from '@jbrowse/bandage-core/layoutModes'
import type { MenuItem } from '@jbrowse/core/ui'
import type { Instance } from '@jbrowse/mobx-state-tree'
import type { DisplayStatusPhase } from '@jbrowse/render-core/displayPhase'

type GraphViewSpec = Omit<LaunchGraphGenomeViewArgs, 'session'>

const GraphTrackSettingsDialog = lazy(
  () => import('./components/GraphTrackSettingsDialog'),
)

export function stateModelFactory(configSchema: LinearGraphDisplayConfigModel) {
  return (
    types
      .compose(
        'LinearGraphDisplay',
        BaseDisplay,
        TrackHeightMixin(),
        GraphPaneMixin(),
        HaplotypeOverviewMixin(),
        types.model({
          type: types.literal('LinearGraphDisplay'),
          configuration: ConfigurationReference(configSchema),
          // A 4.0 entry's nested state, which preProcessSnapshot folds flat and
          // so never holds. Declared so a session spec stating it is not
          // reported as an unknown key.
          pane: types.maybe(types.frozen()),
          // the window the graph on screen was asked for, so a restored
          // session cuts it again
          cutRegion: types.maybe(types.frozen<SubgraphRegion>()),
          // whether that cut came from the track's coarse pair
          // (RgfaTabixAdapter), on which no bp cap applies
          coarseCut: types.optional(types.boolean, false),
          // The bp ceiling on a fine cut, a proxy for node count that only
          // holds at fine granularity; `maxGraphNodes` counts what came back.
          maxRegionBp: types.optional(types.number, MAX_GRAPH_REGION_BP),
          // How far the cut follows links past the region's own segments. At
          // 0 a detour that leaves the backbone before the window and rejoins
          // after it arrives as a fragment, since its interior is indexed only
          // under its own sequence, so one bubble draws as two unrelated
          // insertions. A hop follows alleles only, so it never walks the
          // backbone out of the window.
          subgraphContext: types.optional(types.number, 1),
          // the haplotypes a GBZ cut is for; unset is the lanes the track names
          subgraphHaplotypes: types.maybe(types.frozen<string[]>()),
        }),
      )
      // a 4.0 session nests the graph's state under `pane`
      .preProcessSnapshot(snapshot => {
        const { pane, ...rest } = snapshot as { pane?: { type?: string } }
        if (!pane) {
          return snapshot
        }
        const { type: _type, ...props } = pane
        return { ...props, ...rest } as typeof snapshot
      })
      .volatile(() => ({
        recuts: 0,
        // the host window the settle clock last woke on
        settledWindow: undefined as HostWindow | undefined,
      }))
      .views(self => ({
        get adapterConfig() {
          return trackAdapterConfig(self, self.parentTrack.configuration)
        },
        get defaultLayoutMode(): LayoutModeValue {
          return getConf(self, 'layoutMode')
        },
        get defaultColorScheme(): ColorScheme {
          return getConf(self, 'colorScheme')
        },
        // The linear view leaves its highlight bands off this track while false
        get drawsGenomicCoordinates() {
          return self.layoutResult === undefined || self.hostPlacesX
        },
        get canvasHeight() {
          return self.height
        },
        get canRetryLoad() {
          return self.cutRegion !== undefined
        },
        get cutHaplotypes() {
          return this.chosenHaplotypes
        },
        get chosenHaplotypes() {
          return (
            self.subgraphHaplotypes ??
            trackLanes(self.parentTrack.configuration)
          )
        },
        // the linear view's zoom past which the track's coarse pair is cut, or
        // undefined for a track with none
        get coarseAboveBpPerPx() {
          const coarse = self.adapterConfig.coarse as
            { aboveBpPerPx?: unknown } | undefined
          const above = coarse?.aboveBpPerPx
          return typeof above === 'number' ? above : undefined
        },
      }))
      .views(self => ({
        tierAt(bpPerPx: number): SubgraphTier {
          const above = self.coarseAboveBpPerPx
          return above !== undefined && bpPerPx > above ? 'coarse' : 'fine'
        },
        capFor(tier: SubgraphTier) {
          return tier === 'coarse' ? Infinity : self.maxRegionBp
        },
        get cutTier(): SubgraphTier {
          return self.coarseCut && self.coarseAboveBpPerPx !== undefined
            ? 'coarse'
            : 'fine'
        },
      }))
      .views(self => ({
        get settledCapBp() {
          const seen = self.settledWindow
          return seen ? self.capFor(self.tierAt(seen.bpPerPx)) : Infinity
        },
      }))
      .views(self => ({
        get regionTooLarge() {
          const seen = self.settledWindow
          return seen !== undefined && seen.end - seen.start > self.settledCapBp
        },
        get regionTooLargeReason() {
          const seen = self.settledWindow
          return seen
            ? `Region too large for a graph cut (${formatSpanBp(seen.end - seen.start)}, max ${formatSpanBp(self.settledCapBp)})`
            : ''
        },
        get overviewCapable() {
          return self.adapterConfig.type === 'GbzBaseSyntenyAdapter'
        },
        get zoomCanReleaseGate() {
          return true
        },
        get fetchCanceled() {
          return self.loadCanceled
        },
      }))
      .views(self => ({
        // Past the cut a GBZ track draws its haplotype index's overview: past
        // the bp cap, and at or past the span whose cut ran over its node
        // limit, so where it switches follows how dense the graph is
        get showsOverview() {
          const seen = self.settledWindow
          return (
            self.overviewCapable &&
            seen !== undefined &&
            (self.regionTooLarge || denseCovers(self.dense, seen))
          )
        },
      }))
      .views(self => ({
        get overviewPhase(): DisplayStatusPhase {
          return computeDisplayStatusPhase(
            { regionTooLarge: false, error: self.overviewError },
            () =>
              computeActivityPhase(
                {
                  isMinimized: self.isMinimized,
                  fetchInert: false,
                  viewportEmpty:
                    self.host?.initialized === true &&
                    self.host.hasVisibleContent === false,
                  isLoading: self.overviewLoading || !self.overview,
                  fetchCanceled: false,
                  awaitingDependentData: false,
                  rendersCanvas: true,
                  canvasDrawn:
                    self.overview !== undefined &&
                    self.overviewPainted === self.overview,
                },
                () => true,
                () => self.host?.effectiveBodyMounted ?? true,
              ),
          )
        },
        get displayPhase(): DisplayStatusPhase {
          if (self.showsOverview) {
            return this.overviewPhase
          }
          // A backend that failed is an error the canvas reports with its
          // retry; the status chrome has no renderError phase of its own.
          return computeDisplayStatusPhase(
            {
              regionTooLarge: self.regionTooLarge,
              error: self.error ?? self.renderError,
            },
            () =>
              computeActivityPhase(
                {
                  isMinimized: self.isMinimized,
                  fetchInert: false,
                  viewportEmpty:
                    self.host?.initialized === true &&
                    self.host.hasVisibleContent === false,
                  isLoading: self.isLoading || !self.hasGraph,
                  fetchCanceled: self.loadCanceled,
                  awaitingDependentData: false,
                  rendersCanvas: true,
                  canvasDrawn: self.painted && self.geometryPainted,
                },
                () => true,
                () => self.host?.effectiveBodyMounted ?? true,
              ),
          )
        },
      }))
      .actions(self => ({
        // The setters describe the next cut; the caller re-cuts.
        setSubgraphContext(hops: number) {
          self.subgraphContext = hops
        },
        setSubgraphHaplotypes(haplotypes: string[] | undefined) {
          self.subgraphHaplotypes = haplotypes
          self.forgetOverview()
        },
        setMaxRegionBp(bp: number) {
          self.maxRegionBp = bp
        },
        // Cut `cutRegion` again with the current options. A hop past a coarse
        // cut reaches nothing new: every bubble node's two links are indexed
        // under the backbone either side of it.
        // Past the cut, the overview is what the options re-read
        cut() {
          const seen = self.settledWindow
          if (seen && self.showsOverview) {
            return self.fetchOverview(
              self.adapterConfig,
              seen,
              self.chosenHaplotypes,
            )
          }
          const region = self.cutRegion
          if (!region) {
            return
          }
          const problem = offReferenceProblem(
            graphReferenceAssembly(self.parentTrack.configuration),
            region.assemblyName,
          )
          if (problem) {
            self.clearGraph()
            self.setError(new Error(problem))
            return
          }
          const coarse = self.cutTier === 'coarse'
          return self.cutSubgraph(self.adapterConfig, region, {
            hops: coarse ? 0 : self.subgraphContext,
            haplotypes: self.chosenHaplotypes,
            tier: coarse ? 'coarse' : undefined,
            ...(layoutModeByValue(self.chosenLayoutMode).wholeWalks
              ? { snarls: 'overlapping' as const }
              : {}),
          })
        },
      }))
      .actions(self => ({
        recutAt(seen: HostWindow) {
          const tier = self.tierAt(seen.bpPerPx)
          self.coarseCut = tier === 'coarse'
          self.cutRegion = hostCut(
            seen,
            self.capFor(tier),
            layoutModeByValue(self.chosenLayoutMode).cutMargins,
          )
          self.recuts++
          return self.cut()
        },
      }))
      .actions(self => ({
        // The settle clock. A window the cut still holds fetches nothing; one
        // past its edge re-cuts, on the tier the zoom asks for, with margins
        // when the host places x and the window alone when the layout draws
        // its own picture of it. A canceled cut is re-made by the next move.
        // Returns whether it re-cut.
        settleOn(seen: HostWindow): boolean {
          self.settledWindow = seen
          if (self.showsOverview) {
            if (!self.overviewHolds(seen)) {
              void self.fetchOverview(
                self.adapterConfig,
                seen,
                self.chosenHaplotypes,
              )
            }
            return false
          }
          const margins = layoutModeByValue(self.chosenLayoutMode).cutMargins
          if (
            self.regionTooLarge ||
            (!self.loadCanceled &&
              self.tierAt(seen.bpPerPx) === self.cutTier &&
              cutHolds(self.cutRegion, seen, margins))
          ) {
            return false
          }
          // The error is the latest cut's, since a cut clears it as it
          // starts and an outrun cut sets nothing
          void Promise.resolve(self.recutAt(seen)).then(() => {
            if (
              isAlive(self) &&
              self.overviewCapable &&
              isNodeLimitError(self.error)
            ) {
              this.refuseDenseCut(seen)
            }
          })
          return true
        },
        // A cut refused for its node count holds nothing, so a window
        // narrower than this one cuts again
        refuseDenseCut(seen: HostWindow) {
          self.setDense(seen)
          self.cutRegion = undefined
          this.settleOn(self.settledWindow ?? seen)
        },
        switchLayout(mode: LayoutModeValue) {
          const from = layoutModeByValue(self.chosenLayoutMode)
          self.setLayoutMode(mode)
          const to = layoutModeByValue(mode)
          const seen = self.host ? hostWindow(self.host) : undefined
          if (
            seen &&
            !self.regionTooLarge &&
            (to.cutMargins !== from.cutMargins ||
              to.wholeWalks !== from.wholeWalks)
          ) {
            return self.recutAt(seen)
          }
          return self.recomputeLayout()
        },
        retryLoad() {
          void self.cut()
        },
        reload() {
          void self.cut()
        },
        cancelFetchByUser() {
          self.stopLoad()
        },
      }))
      .actions(self => ({
        forceLoad() {
          const seen = self.settledWindow
          if (seen) {
            self.setMaxRegionBp(Math.ceil(seen.end - seen.start))
            self.settleOn(seen)
          }
        },
        // The host's two clocks. The frame clock moves x with every frame of
        // the linear view and fetches nothing; the settle clock wakes on its
        // debounced blocks.
        afterAttach() {
          if (self.cutRegion && !self.graph) {
            void self.cut()
          }
          addDisposer(
            self,
            reaction(
              () => self.hostPlacesX,
              places => {
                if (!places) {
                  self.releaseHost()
                }
              },
              { name: 'GraphHostPlacesX' },
            ),
          )
          addDisposer(
            self,
            reaction(
              () => self.hostFrame,
              frame => {
                if (frame) {
                  self.hostTransform(frame.scale, frame.translateX)
                }
              },
              {
                equals: (a, b) =>
                  a?.scale === b?.scale && a?.translateX === b?.translateX,
                fireImmediately: true,
                name: 'GraphHostFrame',
              },
            ),
          )
          // A track clips what runs past its height, so side-by-side panels
          // grow it to what they need as a pane of their own. Only a change in
          // the panels does this, so a track shrunk afterwards stays shrunk.
          addDisposer(
            self,
            reaction(
              () => `${self.facet.field} ${self.facetPlacement?.count}`,
              () => {
                const needs = self.facetGridIn(self.paneCeiling)?.total ?? 0
                if ((self.facetGrid?.total ?? 0) > self.height) {
                  self.setHeight(Math.max(self.height, Math.ceil(needs)))
                }
              },
              { name: 'GraphFacetHeight' },
            ),
          )
          addDisposer(
            self,
            reaction(
              () => self.host?.coarseDynamicBlocks,
              blocks => {
                const { host } = self
                const seen = blocks && host ? hostWindow(host) : undefined
                if (seen) {
                  self.settleOn(seen)
                }
              },
              { fireImmediately: true, name: 'GraphHostSettle' },
            ),
          )
        },
      }))
      .views(self => ({
        // The window on screen as a view of its own, drawn as the track draws
        // it: the cut less the margins it holds for panning. A window forced
        // past the cap carries its own span as the cap.
        get graphViewSpec() {
          const seen = self.host ? hostWindow(self.host) : undefined
          const trackId = self.sourceTrackId
          if (
            !seen ||
            !trackId ||
            !self.hasGraph ||
            self.coarseCut ||
            self.regionTooLarge
          ) {
            return undefined
          }
          const start = Math.floor(seen.start)
          const end = Math.ceil(seen.end)
          return {
            loadedTrackId: trackId,
            loadedRegion: {
              refName: seen.refName,
              assemblyName: seen.assemblyName,
              start,
              end,
            },
            subgraphContext: self.subgraphContext,
            subgraphHaplotypes: self.chosenHaplotypes,
            maxRegionBp: Math.max(self.maxRegionBp, end - start),
            layoutMode: self.chosenLayoutMode,
            colorScheme: self.chosenColorScheme,
            referencePath: self.referencePath,
            geneTrackId: self.geneTrackId,
            showGenes: self.showGenes,
            showBubbles: self.showBubbles,
            showDeletionEdges: self.showDeletionEdges,
            walkLayers: self.walkLayers,
            facet: getSnapshot(self.facet),
          } satisfies GraphViewSpec
        },
      }))
      .actions(self => ({
        openGraphView() {
          const spec = self.graphViewSpec
          if (spec) {
            getSession(self).addView('GraphGenomeView', spec)
          }
        },
      }))
      .views(self => ({
        trackMenuItems(): MenuItem[] {
          const launches = self.launchMenuItems()
          pushLaunchViewMenuItem(launches, {
            label: 'Graph genome view',
            icon: BubbleChartIcon,
            disabled: !self.graphViewSpec,
            disabledHelpText: 'Zoom in until the track cuts a graph',
            onClick: () => {
              self.openGraphView()
            },
          })
          return [
            ...self.graphMenuItems(),
            ...(self.overviewCapable
              ? [
                  {
                    label: 'Zoomed out: every haplotype',
                    subLabel: 'Off draws only the lanes the track names',
                    type: 'checkbox' as const,
                    checked: self.overviewAllRows,
                    onClick: () => {
                      self.setOverviewAllRows(!self.overviewAllRows)
                    },
                  },
                ]
              : []),
            {
              label: 'Settings',
              icon: SettingsIcon,
              onClick: () => {
                getSession(self).queueDialog(onClose => [
                  GraphTrackSettingsDialog,
                  { model: self, open: true, onClose },
                ])
              },
            },
            ...launches,
          ]
        },
      }))
  )
}

export type LinearGraphDisplayStateModel = ReturnType<typeof stateModelFactory>
export type LinearGraphDisplayModel = Instance<LinearGraphDisplayStateModel>
// what the track's own settings read, which the track menu that opens them
// cannot name without naming itself
export type LinearGraphCutModel = Omit<
  LinearGraphDisplayModel,
  'trackMenuItems'
>
