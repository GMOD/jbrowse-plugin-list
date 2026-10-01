import { layoutModeByValue } from '@jbrowse/bandage-core/layoutModes'
import { readConfObject } from '@jbrowse/core/configuration'
import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes/models'
import { getSession } from '@jbrowse/core/util'
import { types } from '@jbrowse/mobx-state-tree'

import { GraphPaneMixin, MAX_GRAPH_REGION_BP, formatSpanBp } from './model'
import {
  graphReferenceAssembly,
  offReferenceProblem,
} from '../graphTrackConfig'

import type { SubgraphRegion } from '../GetSubgraph'
import type { LayoutModeValue } from '@jbrowse/bandage-core/layoutModes'
import type { AnyConfigurationModel } from '@jbrowse/core/configuration'
import type { FileLocation } from '@jbrowse/core/util/types'
import type { Instance } from '@jbrowse/mobx-state-tree'

// the last segment of a file's path, its query dropped, or a blob's own name
function fileName(location: FileLocation) {
  const path =
    'uri' in location
      ? location.uri.split(/[?#]/)[0]!
      : 'localPath' in location
        ? location.localPath
        : 'name' in location
          ? location.name
          : ''
  return path.split(/[\\/]/).at(-1) ?? ''
}

export default function stateModelFactory() {
  return types
    .compose(
      'GraphGenomeView',
      BaseViewModel,
      GraphPaneMixin(),
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
        subgraphContext: types.optional(types.number, 1),
        subgraphHaplotypes: types.maybe(types.frozen<string[]>()),
        maxRegionBp: types.optional(types.number, MAX_GRAPH_REGION_BP),
      }),
    )
    .views(self => ({
      get rpcSessionId() {
        return self.id
      },
      // a view is not its own containing view
      get paneWidth() {
        return self.width
      },
      get cutHaplotypes() {
        return self.subgraphHaplotypes
      },
      get sourceGfaLocation() {
        return self.gfaLocation
      },
      get sourceTrack(): AnyConfigurationModel | undefined {
        return self.loadedTrackId
          ? getSession(self).tracks.find(t => t.trackId === self.loadedTrackId)
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
        return self.launchMenuItems()
      },
    }))
    .actions(self => {
      const clearPane = self.clearGraph
      return {
        // the stated source goes too, or a reloaded session would load the
        // dismissed graph again
        clearGraph() {
          clearPane()
          self.gfaLocation = undefined
          self.loadedRegion = undefined
          self.loadedTrackId = ''
        },
        load() {
          const region = self.loadedRegion
          if (self.gfaLocation) {
            // a whole file has no assembly to name the view by
            if (!self.displayName) {
              self.setDisplayName(fileName(self.gfaLocation))
            }
            return self.loadGFAFromLocation(self.gfaLocation, region)
          }
          if (!self.loadedTrackId || !region) {
            return
          }
          const track = self.sourceTrack
          const span = region.end - region.start
          const problem = track
            ? offReferenceProblem(
                graphReferenceAssembly(track),
                region.assemblyName,
              )
            : undefined
          if (!track) {
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
            return self.cutSubgraph(readConfObject(track, 'adapter'), region, {
              hops: self.subgraphContext,
              haplotypes: self.subgraphHaplotypes,
              ...(layoutModeByValue(self.chosenLayoutMode).wholeWalks
                ? { snarls: 'overlapping' as const }
                : {}),
            })
          }
          return undefined
        },
      }
    })
    .actions(self => ({
      retryLoad() {
        void self.load()
      },
      // walk rows measures whole walks, which a GBZ cut only follows when
      // asked, so entering or leaving it cuts the track again
      switchLayout(mode: LayoutModeValue) {
        const from = layoutModeByValue(self.chosenLayoutMode)
        self.setLayoutMode(mode)
        return self.loadedTrackId &&
          layoutModeByValue(mode).wholeWalks !== from.wholeWalks
          ? self.load()
          : self.recomputeLayout()
      },
      // Here rather than when the rendering backend starts: the canvas only
      // mounts once there is a graph, so a view whose graph must be fetched
      // would never fetch it.
      afterAttach() {
        if (!self.graph) {
          void self.load()
        }
      },
    }))
}

export type GraphGenomeViewModel = Instance<
  ReturnType<typeof stateModelFactory>
>
