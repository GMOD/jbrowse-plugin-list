import GraphNodeHighlight from './GraphNodeHighlight'

import type PluginManager from '@jbrowse/core/PluginManager'

// The graph-to-linear half of the hover sync. The reverse half needs no mount
// point: an LGV already publishes its hover to `session.hovered`, and the graph
// view's own autorun reads it (see GraphGenomeView/model.ts).
//
// Mounted through the extension point rather than imported by the LGV, so this
// plugin never imports @jbrowse/plugin-linear-genome-view at runtime: it is not
// one of JBrowse's shared globals, so a value import would bundle a second copy
// of that whole plugin.
const POINT = 'LinearGenomeView-TracksContainerComponent'

export default function GraphHoverSyncF(pluginManager: PluginManager) {
  pluginManager.contributeToExtensionPoint(POINT, ({ model }) => (
    <GraphNodeHighlight key="graphgenomeview-hover-highlight" model={model} />
  ))
}
