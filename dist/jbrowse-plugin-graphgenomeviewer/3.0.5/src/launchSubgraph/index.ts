import { getConf } from '@jbrowse/core/configuration'
import { pushLaunchViewMenuItem } from '@jbrowse/core/ui'
import {
  getContainingTrack,
  getContainingView,
  getSession,
} from '@jbrowse/core/util'

import {
  SUBGRAPH_REGION_LABEL,
  regionAroundSegment,
  regionFromViewport,
} from './launchSubgraphView'
import { subgraphMenuItems } from './subgraphMenuItems'
import {
  adapterCanCutSubgraph,
  subgraphTrack,
  subgraphTracks,
} from './subgraphTracks'

import type { SubgraphTrack } from './subgraphTracks'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { PluggableElementType } from '@jbrowse/core/pluggableElementTypes'
import type DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'
import type { AbstractTrackModel } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

// An RgfaTabixAdapter track is an ordinary feature track, so its segments
// already draw in the LGV's basic display; these two items are the only
// graph-specific UI a linear view needs.
function isTargetDisplay(elt: { name: string }): elt is DisplayType {
  return elt.name === 'LinearBasicDisplay'
}

function canCutSubgraph(
  pluginManager: PluginManager,
  track: AbstractTrackModel,
) {
  return adapterCanCutSubgraph(pluginManager, getConf(track, ['adapter']).type)
}

// The graph track a launch from this display draws from, when the display's own
// track is the graph. One entry, so the menu offers no choice that isn't one.
function ownTrack(
  track: AbstractTrackModel,
  view: LinearGenomeViewModel,
): SubgraphTrack[] {
  return [
    subgraphTrack(
      track.configuration,
      getConf(track, 'trackId'),
      getSession(track),
      view,
    ),
  ]
}

export default function LaunchSubgraphMenuItemF(pluginManager: PluginManager) {
  pluginManager.addToExtensionPoint(
    'Core-extendPluggableElement',
    (pluggableElement: PluggableElementType) => {
      if (!isTargetDisplay(pluggableElement)) {
        return pluggableElement
      }
      // extendStateModel, NOT `stateModel = stateModel.extend(...)`. The host
      // registers display and view state models as LAZY LOADERS now, so the
      // `stateModel` getter is undefined until the loader resolves; a
      // synchronous read here extends nothing, and silently, since the
      // extension point still returns the element and every menu item this file
      // adds simply never appears. extendStateModel queues the extension for
      // the loader to apply, and still runs inline when the model is present.
      pluggableElement.extendStateModel(stateModel =>
        stateModel.extend(self => {
          const superTrackMenuItems = self.trackMenuItems
          const superContextMenuItems = self.contextMenuItems
          return {
            views: {
              trackMenuItems() {
                const items = superTrackMenuItems()
                const track = getContainingTrack(self)
                if (canCutSubgraph(pluginManager, track)) {
                  const view = getContainingView(self) as LinearGenomeViewModel
                  for (const item of subgraphMenuItems({
                    label: SUBGRAPH_REGION_LABEL,
                    region: regionFromViewport(
                      view.dynamicBlocks.contentBlocks,
                    ),
                    tracks: ownTrack(track, view),
                    session: getSession(self),
                    connectedViewId: view.id,
                  })) {
                    pushLaunchViewMenuItem(items, item)
                  }
                }
                return items
              },
              // The right-clicked feature. `contextMenuInfo.item` already carries
              // its bp span, so this needs no feature fetch.
              //
              // The graph the subgraph comes from need not be this track. A bubble
              // marks exactly where haplotypes diverge and is the most natural
              // thing to right-click, but MinigraphBubbleAdapter reads a summary
              // index and cannot cut a graph; a gene is worth asking the same
              // question of. So a track that can't cut one falls back to the
              // session's graph tracks, and the item appears only when there is
              // one to draw from.
              contextMenuItems() {
                const items = superContextMenuItems()
                const info = self.contextMenuInfo
                const track = getContainingTrack(self)
                if (info) {
                  const view = getContainingView(self) as LinearGenomeViewModel
                  const displayedRegion =
                    view.displayedRegions[info.displayedRegionIndex]
                  const own = canCutSubgraph(pluginManager, track)
                  if (displayedRegion) {
                    const launchItems = subgraphMenuItems({
                      label: own
                        ? 'Graph genome view (this segment)'
                        : 'Graph genome view (this feature)',
                      region: regionAroundSegment({
                        refName: displayedRegion.refName,
                        assemblyName: displayedRegion.assemblyName,
                        start: info.item.startBp,
                        end: info.item.endBp,
                      }),
                      tracks: own
                        ? ownTrack(track, view)
                        : subgraphTracks(
                            pluginManager,
                            getSession(self),
                            displayedRegion.assemblyName,
                            view,
                          ),
                      session: getSession(self),
                      connectedViewId: view.id,
                    })
                    for (const item of launchItems) {
                      pushLaunchViewMenuItem(items, item)
                    }
                  }
                }
                return items
              },
            },
          }
        }),
      )
      return pluggableElement
    },
  )
}
