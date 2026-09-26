import { lazy } from 'react'

import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'
import { defineLaunchKeys } from '@jbrowse/core/util/withLaunchInput'

import modelFactory from './model'

import type PluginManager from '@jbrowse/core/PluginManager'

// This view has NO launch keys, and saying so is what turns the check on.
//
// A launch key is a spec field the launcher interprets rather than assigns — an
// LGV's `assembly` and `loc`, resolved into `displayedRegions`. Every field of
// a graph launch is a plain persisted prop instead (see
// LaunchGraphGenomeView), so the registration is empty; what it buys is
// `ViewType.acceptedKeys`, which is `undefined` until a view declares its
// launch vocabulary, and which `loadSessionSpec` needs to report
// `ignored unknown key(s)`.
//
// Without it a session spec's typo in a GraphGenomeView entry is silent: the
// key lands in the snapshot, MST drops it, and the view opens on the import
// form with nothing said. That surface is written by hand with no compiler
// behind it — `sessionSpec()` takes a bare `object` — and the docs build two
// dozen graph figures through it, `loadedRegion` and `loadedTrackId` among the
// fields a misspelling would silently cost.
//
// Ignored by a host that predates `acceptedKeys`: its ViewType constructor
// reads the options it knows and this is not one of them.
const graphLaunchKeys = defineLaunchKeys<object>()({})

export default function GraphGenomeViewF(pluginManager: PluginManager) {
  pluginManager.addViewType(() => {
    return new ViewType({
      name: 'GraphGenomeView',
      displayName: 'Graph genome view',
      stateModel: modelFactory(),
      launchKeys: graphLaunchKeys,
      ReactComponent: lazy(() => import('./components/GraphGenomeView')),
    })
  })
}
