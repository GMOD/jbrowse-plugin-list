import { lazy } from 'react'
import type { ReactNode } from 'react'

import { layoutModeByValue } from '@jbrowse/bandage-core/layoutModes'
import {
  TRACK_FITS,
  TRACK_FIT_LABELS,
  grownHeight,
} from '@jbrowse/bandage-core/trackFit'
import {
  ConfigurationReference,
  getConf,
  setConf,
} from '@jbrowse/core/configuration'
import { BaseDisplay } from '@jbrowse/core/pluggableElementTypes'
import { computeSvgReady } from '@jbrowse/core/svg/svgReady'
import { getSession } from '@jbrowse/core/util'
import HeightModeMixin from '@jbrowse/display-kit/HeightModeMixin'
import { editPlotMenuItems } from '@jbrowse/display-kit/plotMenu'
import { addDisposer, isAlive, types } from '@jbrowse/mobx-state-tree'
import {
  computeActivityPhase,
  computeDisplayPhase,
} from '@jbrowse/render-core/displayPhase'
import BubbleChartIcon from '@mui/icons-material/BubbleChart'
import HeightIcon from '@mui/icons-material/Height'
import RouteIcon from '@mui/icons-material/Route'
import SettingsIcon from '@mui/icons-material/Settings'
import { reaction, when } from 'mobx'

import {
  isDrawLimitError,
  isNodeLimitError,
  isUnzoomableNodeLimitError,
} from '../nodeLimitError'
import { denseCovers } from './denseWindow'
import {
  cutHolds,
  cutRuleOf,
  hostCut,
  hostWindow,
  sameCut,
  snapLevel,
  snappedCut,
} from '../GraphGenomeView/host'
import { GraphPane, formatSpanBp } from '../GraphGenomeView/model'
import { FACET_KEY_PX } from '../GraphGenomeView/pane/fitViews'
import { paneBase } from '../GraphGenomeView/pane/paneBase'
import {
  configHaplotypes,
  cutsByHaplotype,
  trackLanes,
} from '../graphTrackConfig'
import { pushLaunchItem } from '../launchFromGraph/pushLaunchItem'

import type { LinearGraphDisplayConfigModel } from './configSchema'
import type { SubgraphRegion, SubgraphTier } from '../GetSubgraph'
import type { HostWindow } from '../GraphGenomeView/host'
import type { GraphGrammar } from '../GraphGenomeView/pane/graphViews'
import type { LaunchGraphGenomeViewArgs } from '../LaunchGraphGenomeView'
import type { LinksDrawn } from '../linksDrawn'
import type { LayoutModeValue } from '@jbrowse/bandage-core/layoutModes'
import type { MenuItem } from '@jbrowse/core/ui'
import type { ExportSvgDisplayOptions } from '@jbrowse/display-kit/types'
import type { Instance, SnapshotOut } from '@jbrowse/mobx-state-tree'
import type { DisplayPhase } from '@jbrowse/render-core/displayPhase'

type GraphViewSpec = Omit<LaunchGraphGenomeViewArgs, 'session'>

// the pane's viewport, which a new graph view fits to its drawing
const VIEWPORT_PROPS = new Set(['scale', 'translateX', 'translateY'])

type PaneSettings = Omit<
  SnapshotOut<typeof paneBase>,
  'scale' | 'translateX' | 'translateY'
>

function paneSettings(pane: Instance<typeof paneBase>) {
  return Object.fromEntries(
    Object.keys(paneBase.properties)
      .filter(key => !VIEWPORT_PROPS.has(key))
      .map(key => [key, pane[key as keyof typeof pane]]),
  ) as PaneSettings
}

// A variant under this many of the linear view's pixels folds into the
// reference before layout, so the drawing gains detail as the view zooms in.
// It is the width `gfa-to-tabix build` gives a backbone node at the zoom a
// graph hands over to its coarse tier, so a tier folded at its handover draws
// what the fine cut drew just below it.
export const FOLD_PX = 10

// The linear view's bp per px past which a coarse tier is cut: its own
// `aboveBpPerPx`, else the zoom at which the fine cut folds what the tier did
export function coarseHandover(coarse: unknown) {
  const { aboveBpPerPx, foldBelowBp } = (coarse ?? {}) as {
    aboveBpPerPx?: unknown
    foldBelowBp?: unknown
  }
  return typeof aboveBpPerPx === 'number'
    ? aboveBpPerPx
    : typeof foldBelowBp === 'number' && foldBelowBp > 0
      ? foldBelowBp / FOLD_PX
      : undefined
}

const OVER_LIMIT_KEPT = 64

const GraphSettingsDialog = lazy(
  () => import('../GraphGenomeView/components/GraphSettingsDialog'),
)

export function stateModelFactory(configSchema: LinearGraphDisplayConfigModel) {
  return types
    .compose(
      'LinearGraphDisplay',
      BaseDisplay,
      HeightModeMixin(),
      GraphPane,
      types.model({
        type: types.literal('LinearGraphDisplay'),
        configuration: ConfigurationReference(configSchema),
        // the window the graph on screen was asked for, so a restored
        // session cuts it again
        cutRegion: types.maybe(types.frozen<SubgraphRegion>()),
        // whether that cut came from the track's coarse pair
        // (RgfaTabixAdapter), on which no bp cap applies
        coarseCut: types.optional(types.boolean, false),
      }),
    )
    .volatile(() => ({
      recuts: 0,
      // the host window the settle clock last woke on
      settledWindow: undefined as HostWindow | undefined,
      // where a cut came back over its node limit (denseCovers)
      dense: undefined as SubgraphRegion | undefined,
      // the fold the latest cut asked for
      cutFoldBp: 0,
      overLimit: new Set<string>(),
    }))
    .views(self => ({
      get grammar(): GraphGrammar {
        /* eslint-disable @typescript-eslint/no-unsafe-assignment -- core reads a frozen slot as any */
        return {
          layoutMode: getConf(self, 'layoutMode'),
          layoutEngine: getConf(self, 'layoutEngine'),
          encoding: getConf(self, 'encoding'),
          size: getConf(self, 'size'),
          layers: getConf(self, 'layers'),
          facet: {
            field: getConf(self, ['facet', 'field']),
            sort: getConf(self, ['facet', 'sort']),
            columns: getConf(self, ['facet', 'columns']),
          },
          rows: getConf(self, 'rows'),
          hover: getConf(self, 'hover'),
          links: getConf(self, 'links'),
        }
        /* eslint-enable @typescript-eslint/no-unsafe-assignment */
      },
      // The linear view leaves its highlight bands off this track while false
      get drawsGenomicCoordinates() {
        return self.layoutResult === undefined || self.hostPlacesX
      },
      get canvasHeight() {
        return self.height
      },
      get trackFit() {
        return self.heightMode
      },
      get referenceRoom() {
        return self.heightMode === 'grow' ? self.growMaxHeight : self.height
      },
      get canRetryLoad() {
        return self.cutRegion !== undefined
      },
      // the config's defaultHaplotypes, else the lanes the track names
      get trackHaplotypes() {
        const adapter = self.sourceAdapter
        const track = self.sourceTrack
        return (
          (adapter && configHaplotypes(adapter)) ?? (track && trackLanes(track))
        )
      },
      // the linear view's zoom past which the track's coarse pair is cut, or
      // undefined for a track with none
      get coarseAboveBpPerPx() {
        return coarseHandover(self.sourceAdapter?.coarse)
      },
      // In grow, the height that holds the whole cut at the window's scale,
      // and never less than the key needs
      get growTargetHeight() {
        const scale = self.followsWindow ? self.heldScale : undefined
        const bounds = self.heldBounds
        return scale !== undefined && bounds
          ? Math.max(
              self.canvasFloor,
              grownHeight(bounds, scale, self.followPads),
            )
          : self.fitTargetHeight
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
      // Whether a zoom has moved far enough from the one the drawing was
      // folded for that folding again would show or hide more. A graph with
      // walks is never folded, and a fold rounded to 0 bp counts as 1 bp.
      foldDrifted(bpPerPx: number) {
        const want = FOLD_PX * bpPerPx
        const had = self.cutFoldBp
        return (
          !self.graph?.paths?.length &&
          (want >= 2 * Math.max(had, 1) ||
            (self.foldedBelowBp !== undefined && want <= had / 2))
        )
      },
      get cutTier(): SubgraphTier {
        return self.coarseCut && self.coarseAboveBpPerPx !== undefined
          ? 'coarse'
          : 'fine'
      },
      foldFor(
        region: SubgraphRegion | undefined,
        seen: HostWindow | undefined,
      ) {
        const bpPerPx = seen?.bpPerPx ?? self.host?.bpPerPx ?? 0
        return Math.round(
          FOLD_PX *
            (seen && self.snapsHostCut && sameCut(region, snappedCut(seen))
              ? (bpPerPx * snapLevel(seen.span)) / seen.span
              : bpPerPx),
        )
      },
    }))
    .views(self => ({
      overLimitKey(region: SubgraphRegion, seen: HostWindow) {
        return JSON.stringify([
          region,
          self.tierAt(seen.bpPerPx),
          self.foldFor(region, seen),
          self.cutKey,
          self.maxGraphNodes,
        ])
      },
    }))
    .views(self => ({
      cutFor(seen: HostWindow) {
        const cap = self.capFor(self.tierAt(seen.bpPerPx))
        const snapped = snappedCut(seen)
        return self.snapsHostCut &&
          snapped.end - snapped.start <= cap &&
          !self.overLimit.has(self.overLimitKey(snapped, seen))
          ? snapped
          : hostCut(
              seen,
              cap,
              layoutModeByValue(self.chosenLayoutMode).cutMargins,
            )
      },
    }))
    .views(self => ({
      snapped(region: SubgraphRegion | undefined, seen: HostWindow) {
        return self.snapsHostCut && sameCut(region, snappedCut(seen))
      },
      cutHoldsAt(seen: HostWindow) {
        return self.snapsHostCut
          ? sameCut(self.cutRegion, self.cutFor(seen)) &&
              (!!self.graph?.paths?.length ||
                self.cutFoldBp === self.foldFor(self.cutRegion, seen))
          : cutHolds(
              self.cutRegion,
              seen,
              layoutModeByValue(self.chosenLayoutMode).cutMargins,
            ) && !self.foldDrifted(seen.bpPerPx)
      },
    }))
    .views(self => ({
      get settledCapBp() {
        const seen = self.settledWindow
        return seen ? self.capFor(self.tierAt(seen.bpPerPx)) : Infinity
      },
      get unzoomableBytes() {
        return isUnzoomableNodeLimitError(self.error)
          ? self.error.bytes
          : undefined
      },
    }))
    .views(self => ({
      get regionTooLarge() {
        const seen = self.settledWindow
        return seen !== undefined && seen.end - seen.start > self.settledCapBp
      },
      get regionTooLargeReason() {
        const seen = self.settledWindow
        return isUnzoomableNodeLimitError(self.error)
          ? self.error.message
          : seen
            ? `Region too large for a graph cut (${formatSpanBp(seen.end - seen.start)}, max ${formatSpanBp(self.settledCapBp)})`
            : ''
      },
      get zoomCanReleaseGate() {
        return self.unzoomableBytes === undefined
      },
      get fetchCanceled() {
        return self.loadCanceled
      },
    }))
    .views(self => ({
      get showsTooLarge() {
        return self.regionTooLarge || self.unzoomableBytes !== undefined
      },
    }))
    .views(self => ({
      get svgReady() {
        return computeSvgReady(
          {
            error: self.error,
            regionTooLarge: self.showsTooLarge,
            extraTerminal: false,
            fetchCanceled: self.loadCanceled,
          },
          () => !self.isLoading && self.hasGraph && !!self.layoutResult,
        )
      },
    }))
    .views(self => ({
      // A cut refused over its node limit is an error marked regionTooLarge,
      // which core's error bar shows with no retry
      get displayPhase(): DisplayPhase {
        return computeDisplayPhase(
          {
            renderError: self.renderError,
            regionTooLarge: self.showsTooLarge,
            error: self.error,
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
                canvasDrawn: self.painted,
              },
              () => true,
              () => self.host?.effectiveBodyMounted ?? true,
            ),
        )
      },
    }))
    .actions(self => {
      const { setSubgraphContext, setSubgraphHaplotypes, setLinks } = self
      return {
        // a refused cut may fit under other options
        setSubgraphContext(hops: number) {
          setSubgraphContext(hops)
          self.dense = undefined
        },
        setLinks(links: LinksDrawn) {
          setLinks(links)
          self.dense = undefined
        },
        setSubgraphHaplotypes(haplotypes: string[] | undefined) {
          setSubgraphHaplotypes(haplotypes)
          self.dense = undefined
        },
      }
    })
    .actions(self => ({
      // Into the config, so a share link, Edit plot and Reset track
      // settings all see it
      writeGrammar(settings: GraphGrammar) {
        for (const [slot, value] of Object.entries(settings)) {
          setConf(self, slot as keyof GraphGrammar, value)
        }
      },
      setDense(window: SubgraphRegion | undefined) {
        self.dense = window
      },
      setMaxRegionBp(bp: number) {
        self.maxRegionBp = bp
      },
      // Cut `cutRegion` again with the current options. A coarse cut hops as
      // a fine one does, since a tier is the same graph folded.
      cut() {
        const region = self.cutRegion
        const adapterConfig = self.sourceAdapter
        if (!region || !adapterConfig) {
          return
        }
        const problem = self.offReference(region)
        if (problem) {
          self.clearGraph()
          self.setError(new Error(problem))
          return
        }
        const coarse = self.cutTier === 'coarse'
        const seen =
          self.settledWindow ?? (self.host ? hostWindow(self.host) : undefined)
        self.cutFoldBp = self.foldFor(region, seen)
        self.markCut()
        return self.cutSubgraph(
          adapterConfig,
          region,
          { ...self.cutOptions, tier: coarse ? 'coarse' : undefined },
          self.cutFoldBp,
          !!seen && self.snapped(region, seen),
        )
      },
    }))
    .actions(self => ({
      recutAt(seen: HostWindow) {
        self.settledWindow = seen
        const tier = self.tierAt(seen.bpPerPx)
        self.coarseCut = tier === 'coarse'
        self.cutRegion = self.cutFor(seen)
        self.recuts++
        return self.cut()
      },
    }))
    .actions(self => {
      let followed = 0
      return {
        // An outrun cut resolves without touching the error, so the error
        // is this cut's only while no later one has started
        followCut(cut: ReturnType<typeof self.cut>, seen: HostWindow) {
          const latest = ++followed
          const region = self.cutRegion
          void Promise.resolve(cut).then(overNodeLimit => {
            if (
              isAlive(self) &&
              followed === latest &&
              (overNodeLimit === true || isNodeLimitError(self.error))
            ) {
              if (self.snapped(region, seen)) {
                this.refuseSnappedCut(seen)
              } else {
                this.refuseDenseCut(seen)
              }
            }
          })
        },
        // The settle clock. A window the cut still holds fetches nothing;
        // one past its edge re-cuts, on the tier the zoom asks for, as
        // cutFor says. A canceled cut is re-made by
        // the next move, and a window a refused cut covers keeps its notice
        // without asking again. Returns whether it re-cut.
        settleOn(seen: HostWindow): boolean {
          self.settledWindow = seen
          if (
            self.regionTooLarge ||
            denseCovers(self.dense, seen) ||
            (!self.loadCanceled &&
              self.tierAt(seen.bpPerPx) === self.cutTier &&
              self.cutHoldsAt(seen) &&
              !self.cutStale)
          ) {
            return false
          }
          this.followCut(self.recutAt(seen), seen)
          return true
        },
        // A snapped cut over a node limit holds nothing, so the window is
        // cut alone wherever that snapped cut is the window's
        refuseSnappedCut(seen: HostWindow) {
          const { overLimit } = self
          overLimit.add(self.overLimitKey(snappedCut(seen), seen))
          for (const key of overLimit) {
            if (overLimit.size > OVER_LIMIT_KEPT) {
              overLimit.delete(key)
            }
          }
          this.settleOn(self.settledWindow ?? seen)
        },
        // A cut refused for its node count holds nothing, so a window
        // narrower than this one cuts again
        refuseDenseCut(seen: HostWindow) {
          self.setDense(seen)
          self.cutRegion = undefined
          this.settleOn(self.settledWindow ?? seen)
        },
        // Cut the region again with the current options, or the window on
        // screen where a refused cut left no region
        recut() {
          if (self.cutRegion) {
            this.reload()
          } else if (self.settledWindow) {
            this.settleOn(self.settledWindow)
          }
        },
        relayoutFrom(from: LayoutModeValue) {
          const seen = self.host ? hostWindow(self.host) : undefined
          if (
            seen &&
            !self.regionTooLarge &&
            (self.cutStale ||
              cutRuleOf(from) !== cutRuleOf(self.chosenLayoutMode))
          ) {
            const cut = self.recutAt(seen)
            this.followCut(cut, seen)
            return cut
          }
          return self.recomputeLayout()
        },
        retryLoad() {
          this.recut()
        },
        reload() {
          const seen =
            self.settledWindow ??
            (self.host ? hostWindow(self.host) : undefined)
          const cut = self.cut()
          if (seen) {
            this.followCut(cut, seen)
          }
        },
        cancelFetchByUser() {
          self.stopLoad()
        },
      }
    })
    .actions(self => ({
      stretchWithHost(
        before: { bpPerPx: number; offsetPx: number },
        now: { bpPerPx: number; offsetPx: number },
      ) {
        const bounds = self.layoutBounds
        if (!bounds || !self.followsHostView || self.snapsHostCut) {
          return
        }
        // no longer the fit, so the fit autorun cannot undo it before the
        // re-cut lands; followNewLayout fits the new drawing
        if (self.viewportOwner === 'fit') {
          self.viewportOwner = 'user'
        }
        const k = before.bpPerPx / now.bpPerPx
        const midY =
          self.translateY + self.scaleY * (bounds.minY + bounds.h / 2)
        self.scale *= k
        self.translateX = k * (self.translateX + before.offsetPx) - now.offsetPx
        self.translateY = midY - k * (midY - self.translateY)
      },
    }))
    .actions(self => ({
      forceLoad() {
        const bytes = self.unzoomableBytes
        const seen = self.settledWindow
        if (bytes !== undefined) {
          self.forcedByteBudget = bytes
          self.setDense(undefined)
          self.recut()
        } else if (seen) {
          self.setMaxRegionBp(Math.ceil(seen.end - seen.start))
          self.settleOn(seen)
        }
      },
      // The host's two clocks. The frame clock moves x with every frame of
      // the linear view and fetches nothing; the settle clock wakes on its
      // debounced blocks.
      afterAttach() {
        // a restored cut waits for the view's window, which its fold and
        // snap are read against, unless the settle clock cuts first
        if (self.cutRegion && !self.graph) {
          addDisposer(
            self,
            when(
              () => !self.host || hostWindow(self.host) !== undefined,
              () => {
                if (self.recuts === 0) {
                  self.reload()
                }
              },
            ),
          )
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
        // The stretch clock: a drawing whose x is not bp follows the host's
        // zoom and pan as a screen-space map, x' = k x + c, until the re-cut
        // lands and morphs from it, as a linear track stretches its blocks
        let seen: { bpPerPx: number; offsetPx: number } | undefined
        addDisposer(
          self,
          reaction(
            () =>
              self.host && !self.hostPlacesX
                ? { bpPerPx: self.host.bpPerPx, offsetPx: self.host.offsetPx }
                : undefined,
            now => {
              const before = seen
              seen = now
              if (now && before && now.bpPerPx > 0) {
                self.stretchWithHost(before, now)
              }
            },
            {
              equals: (a, b) =>
                a?.bpPerPx === b?.bpPerPx && a?.offsetPx === b?.offsetPx,
              fireImmediately: true,
              name: 'GraphHostStretch',
            },
          ),
        )
        // A track clips what runs past its height, so side-by-side panels
        // grow it to what they need as a pane of their own. Only a change in
        // the panels does this, so a track shrunk afterwards stays shrunk.
        addDisposer(
          self,
          reaction(
            () => `${self.facetSetting.field} ${self.facetPlacement?.count}`,
            () => {
              const needs =
                (self.facetGridIn(self.paneCeiling - FACET_KEY_PX)?.total ??
                  0) + FACET_KEY_PX
              if ((self.facetGrid?.total ?? 0) + FACET_KEY_PX > self.height) {
                self.setHeight(Math.max(self.height, Math.ceil(needs)))
              }
            },
            { name: 'GraphFacetHeight' },
          ),
        )
        // Nor is the track shorter than its key and the drawing's floor, as a
        // standalone pane is not: a key cut by the track's height loses its
        // last rows. Only a change in that floor grows it, and the labels wait
        // for the track to have answered it.
        self.setAnsweredKeyFloor(self.canvasFloor)
        addDisposer(
          self,
          reaction(
            () => self.canvasFloor,
            floor => {
              if (floor > self.height) {
                self.setHeight(Math.ceil(floor))
              }
              self.setAnsweredKeyFloor(floor)
            },
            { name: 'GraphKeyHeight' },
          ),
        )
        addDisposer(
          self,
          reaction(
            () => self.error,
            error => {
              const seen = self.settledWindow
              if (
                seen &&
                isDrawLimitError(error) &&
                self.snapped(self.cutRegion, seen)
              ) {
                self.refuseSnappedCut(seen)
              }
            },
            { name: 'GraphSnapDrawLimit' },
          ),
        )
        addDisposer(
          self,
          reaction(
            () => self.maxGraphNodes,
            () => {
              const seen = self.settledWindow
              if (seen && self.snapsHostCut) {
                self.settleOn(seen)
              }
            },
            { name: 'GraphSnapNodeLimit' },
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
          self.regionTooLarge ||
          denseCovers(self.dense, seen)
        ) {
          return undefined
        }
        const start = Math.floor(seen.start)
        const end = Math.ceil(seen.end)
        const { encoding, ...grammar } = self.grammar
        return {
          ...paneSettings(self),
          loadedTrackId: trackId,
          loadedRegion: {
            refName: seen.refName,
            assemblyName: seen.assemblyName,
            start,
            end,
          },
          subgraphHaplotypes: self.cutHaplotypes,
          maxRegionBp: Math.max(self.maxRegionBp, end - start),
          ...grammar,
          color: encoding?.color,
          layoutMode: self.chosenLayoutMode,
          connectedViewId: self.host?.id,
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
      // Which haplotypes a GBZ or walk-indexed cut is for: every one in the
      // graph, the config's default set or the assemblies the track names,
      // or a list chosen in Graph settings
      cutMenuItems(): MenuItem[] {
        const adapter = self.sourceAdapter
        const track = self.sourceTrack
        if (!adapter || !track || !cutsByHaplotype(adapter)) {
          return []
        }
        const defaults = configHaplotypes(adapter)
        const lanes = trackLanes(track)
        const names = self.haplotypeNames
        const chosen = self.subgraphHaplotypes
        return [
          { type: 'subHeader', label: 'Load' },
          {
            type: 'radio',
            label: names
              ? `Every haplotype in the graph (${names.length.toLocaleString()})`
              : 'Every haplotype in the graph',
            checked: chosen ? chosen.length === 0 : !defaults && !lanes,
            onClick: () => {
              self.setSubgraphHaplotypes([])
            },
          },
          ...(defaults || lanes
            ? [
                {
                  type: 'radio' as const,
                  label: defaults
                    ? "The track's default haplotypes"
                    : `The track's ${lanes?.length} assemblies`,
                  checked: chosen === undefined,
                  onClick: () => {
                    self.setSubgraphHaplotypes(undefined)
                  },
                },
              ]
            : []),
          {
            type: 'radio',
            label: 'Chosen in Graph settings...',
            checked: (chosen?.length ?? 0) > 0,
            onClick: () => {
              this.openSettings()
            },
          },
        ]
      },
      openSettings() {
        getSession(self).queueDialog(onClose => [
          GraphSettingsDialog,
          { model: self, onClose },
        ])
      },
      async renderSvg(opts?: ExportSvgDisplayOptions): Promise<ReactNode> {
        const { renderGraphTrackSvg } = await import('./renderSvg')
        return renderGraphTrackSvg(
          self as unknown as LinearGraphDisplayModel,
          opts,
        )
      },
      trackMenuItems(): MenuItem[] {
        const launches = self.launchMenuItems()
        pushLaunchItem(launches, {
          label: 'Graph genome view',
          icon: BubbleChartIcon,
          disabled: !self.graphViewSpec,
          disabledHelpText:
            self.error && !isNodeLimitError(self.error)
              ? 'The track could not cut a graph here'
              : self.isLoading && !self.hasGraph
                ? 'The track is still cutting its graph'
                : self.unzoomableBytes !== undefined
                  ? 'Force load the track to cut a graph here'
                  : 'Zoom in until the track cuts a graph',
          onClick: () => {
            self.openGraphView()
          },
        })
        // Per-haplotype items go under Haplotypes, and figure export stays in
        // the graph genome view's menu: the linear view's Export SVG already
        // draws this track
        const haplotypes = [
          ...this.cutMenuItems(),
          ...self.highlightMenuItems(),
        ]
        return [
          ...(haplotypes.length > 0
            ? [{ label: 'Haplotypes', icon: RouteIcon, subMenu: haplotypes }]
            : []),
          ...self.graphMenuItems(),
          {
            label: 'Track sizing',
            icon: HeightIcon,
            subMenu: TRACK_FITS.map(fit => ({
              type: 'radio' as const,
              label: TRACK_FIT_LABELS[fit],
              checked: self.heightMode === fit,
              onClick: () => {
                self.setHeightMode(fit)
              },
            })),
          },
          {
            label: 'Graph settings...',
            icon: SettingsIcon,
            helpText: 'Subgraph, drawing and force-directed layout',
            onClick: () => {
              this.openSettings()
            },
          },
          ...launches,
          ...editPlotMenuItems(self),
        ]
      },
    }))
}

export type LinearGraphDisplayStateModel = ReturnType<typeof stateModelFactory>
export type LinearGraphDisplayModel = Instance<LinearGraphDisplayStateModel>
