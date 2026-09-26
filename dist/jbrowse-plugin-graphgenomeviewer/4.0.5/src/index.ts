import Plugin from '@jbrowse/core/Plugin'
import { isAbstractMenuManager } from '@jbrowse/core/util'
import BubbleChartIcon from '@mui/icons-material/BubbleChart'

import GbzBaseSyntenyAdapterF from './GbzBaseSyntenyAdapter/index'
import GetSubgraph from './GetSubgraph'
import GraphAddTrackWorkflowF from './GraphAddTrackWorkflow/index'
import GraphComputeLayout from './GraphComputeLayout'
import GraphGenomeViewF from './GraphGenomeView/index'
import LaunchGraphGenomeViewF from './LaunchGraphGenomeView'
import LinearGraphDisplayF from './LinearGraphDisplay/index'
import MinigraphBubbleAdapterF from './MinigraphBubbleAdapter/index'
import RgfaTabixAdapterF from './RgfaTabixAdapter/index'
import GraphHoverSyncF from './hoverSync/index'
import { PLUGIN_NAME } from './pluginName'
import { version } from './version'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { AbstractSessionModel } from '@jbrowse/core/util'

export default class GraphGenomeViewPlugin extends Plugin {
  name = PLUGIN_NAME
  version = version

  install(pluginManager: PluginManager) {
    GraphGenomeViewF(pluginManager)
    LinearGraphDisplayF(pluginManager)
    LaunchGraphGenomeViewF(pluginManager)
    GraphHoverSyncF(pluginManager)
    RgfaTabixAdapterF(pluginManager)
    MinigraphBubbleAdapterF(pluginManager)
    GbzBaseSyntenyAdapterF(pluginManager)
    GraphAddTrackWorkflowF(pluginManager)
    pluginManager.addRpcMethod(() => new GraphComputeLayout(pluginManager))
    pluginManager.addRpcMethod(() => new GetSubgraph(pluginManager))
  }

  // A throw from configure() takes the whole session to its error page, and a
  // menu entry is not worth that: hubs 1.0.9 did exactly this to every
  // jbrowse.org/ucsc launch by appending to a menu a released host defines as
  // a function. The view is still reachable without the entry.
  configure(pluginManager: PluginManager) {
    try {
      if (isAbstractMenuManager(pluginManager.rootModel)) {
        pluginManager.rootModel.appendToSubMenu(['Add'], {
          label: 'Graph genome view',
          icon: BubbleChartIcon,
          onClick: (session: AbstractSessionModel) => {
            session.addView('GraphGenomeView', {})
          },
        })
      }
    } catch (e) {
      console.warn('[GraphGenomeView] could not add the Add menu entry', e)
    }
  }
}
