import { LAYOUT_MODE_VALUES } from '@jbrowse/bandage-core/layoutModes'
import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes/models'
import { getSession } from '@jbrowse/core/util'
import { addDisposer, isAlive, types } from '@jbrowse/mobx-state-tree'
import { reaction } from 'mobx'

import { HOVER_HIGHLIGHT_VALUES } from './hoverHighlight'
import { lenientMaybeEnum } from './lenientEnum'
import { GraphPane, fileName, formatSpanBp } from './model'
import { canonicalRegion } from '../launchFromGraph/launchFromGraph'

import type { GraphLayers } from './graphLayers'
import type { NodeColor } from './nodeColor'
import type { NodeSize } from './nodeSize'
import type { SubgraphRegion } from '../GetSubgraph'
import type { GraphGrammar, GraphRows } from './pane/graphViews'
import type { FacetInput } from '@jbrowse/bandage-core/facetGrid'
import type { LayoutModeValue } from '@jbrowse/bandage-core/layoutModes'
import type { AnyConfigurationModel } from '@jbrowse/core/configuration'
import type { FileLocation } from '@jbrowse/core/util/types'
import type { Instance } from '@jbrowse/mobx-state-tree'

export default function stateModelFactory() {
  return types
    .compose(
      'GraphGenomeView',
      BaseViewModel,
      GraphPane,
      types.model({
        type: types.literal('GraphGenomeView'),
        // a whole GFA the view loads on attach, kept so the source round-trips
        // through a session snapshot
        gfaLocation: types.maybe(types.frozen<FileLocation>()),
        // the reference window the file or the cut was stated beside
        loadedRegion: types.maybe(types.frozen<SubgraphRegion>()),
        // A session track the view cuts `loadedRegion` from once, as 4.0
        // sessions and the docs' figure specs state it. Following the linear
        // view is the track's job (LinearGraphDisplay).
        loadedTrackId: types.optional(types.string, ''),
        // unset is force
        layoutMode: lenientMaybeEnum(LAYOUT_MODE_VALUES),
        color: types.maybe(types.frozen<NodeColor>()),
        size: types.maybe(types.frozen<NodeSize>()),
        layers: types.maybe(types.frozen<GraphLayers>()),
        facet: types.maybe(types.frozen<FacetInput>()),
        rows: types.maybe(types.frozen<GraphRows>()),
        // unset is nodes
        hover: lenientMaybeEnum(HOVER_HIGHLIGHT_VALUES),
      }),
    )
    .views(self => ({
      get grammar(): GraphGrammar {
        return {
          layoutMode: self.layoutMode,
          color: self.color,
          size: self.size,
          layers: self.layers,
          facet: self.facet,
          rows: self.rows,
          hover: self.hover,
        }
      },
    }))
    .actions(self => ({
      writeGrammar(settings: GraphGrammar) {
        Object.assign(self, settings)
      },
    }))
    .volatile(() => ({
      widthMeasured: false,
    }))
    .actions(self => {
      const setBaseWidth = self.setWidth
      return {
        setWidth(width: number) {
          setBaseWidth(width)
          self.widthMeasured = true
        },
      }
    })
    .views(self => ({
      get rpcSessionId() {
        return self.id
      },
      // a view is not its own containing view
      get paneWidth() {
        return self.width
      },
      // until then the width is BaseViewModel's 800 px default
      get paneMeasured() {
        return self.widthMeasured
      },
      get sourceTrack(): AnyConfigurationModel | undefined {
        return self.loadedTrackId
          ? self.sessionTrack(self.loadedTrackId)
          : undefined
      },
      get canRetryLoad() {
        return (
          self.gfaLocation !== undefined ||
          (self.loadedTrackId !== '' && self.loadedRegion !== undefined)
        )
      },
    }))
    .views(self => ({
      get hasPendingSource() {
        return self.canRetryLoad && !self.graph && !self.loadCanceled
      },
      menuItems() {
        return [...self.exportMenuItems(), ...self.launchMenuItems()]
      },
    }))
    .actions(self => {
      const clearPane = self.clearGraph
      function loadRegion(region: SubgraphRegion | undefined) {
        if (self.gfaLocation) {
          // a whole file has no assembly to name the view by
          if (!self.displayName) {
            self.setDisplayName(fileName(self.gfaLocation))
          }
          return self.loadGFAFromLocation(self.gfaLocation, region)
        }
        if (!self.loadedTrackId || !region) {
          return undefined
        }
        const adapter = self.sourceAdapter
        const span = region.end - region.start
        const problem = self.offReference(region)
        if (!adapter) {
          self.setError(
            new Error(
              `The track this graph was cut from, "${self.loadedTrackId}", is not in this session`,
            ),
          )
        } else if (problem) {
          self.setError(new Error(problem))
        } else if (span > self.maxRegionBp) {
          self.setError(
            new Error(
              `Region too large (${formatSpanBp(span)}) — zoom in to view graph (max ${formatSpanBp(self.maxRegionBp)})`,
            ),
          )
        } else {
          return self.cutSubgraph(adapter, region, self.cutOptions)
        }
        return undefined
      }
      return {
        // the stated source goes too, or a reloaded session would load the
        // dismissed graph again, and so does a name taken from its file
        clearGraph() {
          clearPane()
          if (
            self.gfaLocation &&
            self.displayName === fileName(self.gfaLocation)
          ) {
            self.displayName = undefined
          }
          self.gfaLocation = undefined
          self.loadedRegion = undefined
          self.loadedTrackId = ''
        },
        // The graph keeps the region by the session's names, which hover sync
        // and launches compare with, so a stated alias resolves first, once
        // its assembly's refName aliases have loaded.
        load(): Promise<void> | undefined {
          const stated = self.loadedRegion
          const session = getSession(self)
          const { assemblyManager } = session
          const assembly =
            stated && assemblyManager.has(stated.assemblyName)
              ? assemblyManager.get(stated.assemblyName)
              : undefined
          return stated && assembly?.initialized === false
            ? assemblyManager
                .waitForAssembly(stated.assemblyName)
                .catch(() => undefined)
                .then(() =>
                  self.loadedRegion === stated
                    ? loadRegion(canonicalRegion(session, stated))
                    : undefined,
                )
            : loadRegion(stated && canonicalRegion(session, stated))
        },
      }
    })
    .actions(self => ({
      retryLoad() {
        void self.load()
      },
      setGfaLocation(location: FileLocation) {
        self.gfaLocation = location
      },
      // the strip's toggle cuts the track again too (afterAttach)
      relayoutFrom(from: LayoutModeValue) {
        return self.loadedTrackId && self.cutChangedFrom(from)
          ? self.load()
          : self.recomputeLayout()
      },
      // Stated as the source once it loads, so a saved session reopens it; a
      // URL that fails stays in the import form to be corrected.
      async openGfaLocation(location: FileLocation) {
        await self.loadGFAFromLocation(location)
        if (isAlive(self) && self.hasGraph) {
          this.setGfaLocation(location)
          if (!self.displayName) {
            self.setDisplayName(fileName(location))
          }
        }
      },
      // Here rather than when the rendering backend starts: the canvas only
      // mounts once there is a graph, so a view whose graph must be fetched
      // would never fetch it.
      afterAttach() {
        if (!self.graph) {
          void self.load()
        }
        addDisposer(
          self,
          reaction(
            () => self.walkStrip,
            on => {
              if (
                self.loadedTrackId &&
                self.cutsWholeWalks !==
                  self.cutsWholeWalksIn(self.chosenLayoutMode, !on)
              ) {
                void self.load()
              }
            },
          ),
        )
      },
    }))
}

export type GraphGenomeViewModel = Instance<
  ReturnType<typeof stateModelFactory>
>
