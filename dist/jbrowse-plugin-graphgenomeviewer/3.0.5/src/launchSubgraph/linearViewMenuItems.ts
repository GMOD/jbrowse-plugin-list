import { pushLaunchViewMenuItem } from '@jbrowse/core/ui'
import { getSession } from '@jbrowse/core/util'

import { SUBGRAPH_REGION_LABEL, regionFromViewport } from './launchSubgraphView'
import { subgraphMenuItems } from './subgraphMenuItems'
import { subgraphTracks } from './subgraphTracks'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { PluggableElementType } from '@jbrowse/core/pluggableElementTypes'
import type ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

const SELECTION_LABEL = 'Graph genome view (this selection)'

function isLinearGenomeView(elt: { name: string }): elt is ViewType {
  return elt.name === 'LinearGenomeView'
}

// Launch entry points on the linear view itself, rather than on a graph track's
// menu. Two reasons this is where they belong:
//
//   - The graph track need not be in the view, or even turned on. Scanning the
//     session for a subgraph-capable track gives a user browsing genes a way in;
//     before, the only entry point was the menu of a track they might never have
//     opened.
//   - A rubberband selection picks a window directly, with no navigating first,
//     and is the only way to ask about a range narrower than what is on screen.
export default function LinearViewMenuItemsF(pluginManager: PluginManager) {
  pluginManager.addToExtensionPoint(
    'Core-extendPluggableElement',
    (pluggableElement: PluggableElementType) => {
      if (isLinearGenomeView(pluggableElement)) {
        // extendStateModel, NOT `stateModel = stateModel.extend(...)`: see
        // launchSubgraph/index.ts for what a synchronous read costs now that the
        // host registers state models as lazy loaders.
        pluggableElement.extendStateModel(stateModel =>
          stateModel.extend(
            // Annotated rather than cast: the extension point hands over an
            // IAnyModelType, and stating the model shape here is what types
            // `getSelectedRegions`/`dynamicBlocks` below without an `as`.
            (self: LinearGenomeViewModel) => {
              const superMenuItems = self.menuItems
              const superRubberBandMenuItems = self.rubberBandMenuItems

              // Graph tracks for this view's assembly. Empty means every item
              // below is empty too, so a session with no graph data gains no menu
              // clutter.
              function tracks() {
                const assemblyName = self.assemblyNames[0]
                return assemblyName
                  ? subgraphTracks(
                      pluginManager,
                      getSession(self),
                      assemblyName,
                      self,
                    )
                  : []
              }

              return {
                views: {
                  menuItems() {
                    const items = superMenuItems()
                    for (const item of subgraphMenuItems({
                      label: SUBGRAPH_REGION_LABEL,
                      region: regionFromViewport(
                        self.dynamicBlocks.contentBlocks,
                      ),
                      tracks: tracks(),
                      session: getSession(self),
                      connectedViewId: self.id,
                    })) {
                      pushLaunchViewMenuItem(items, item)
                    }
                    return items
                  },

                  // The rubberband menu is short and contextual, so these go in
                  // flat rather than under a "Launch view" submenu — that grouping
                  // earns its keep in the long track and view menus, not here.
                  rubberBandMenuItems() {
                    return [
                      ...superRubberBandMenuItems(),
                      ...subgraphMenuItems({
                        label: SELECTION_LABEL,
                        region: regionFromViewport(
                          self.getSelectedRegions(
                            self.leftOffset,
                            self.rightOffset,
                          ),
                        ),
                        tracks: tracks(),
                        session: getSession(self),
                        connectedViewId: self.id,
                      }),
                    ]
                  },
                },
              }
            },
          ),
        )
      }
      return pluggableElement
    },
  )
}
