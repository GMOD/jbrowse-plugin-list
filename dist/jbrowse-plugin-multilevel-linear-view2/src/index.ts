import Plugin from '@jbrowse/core/Plugin'
import PluginManager from '@jbrowse/core/PluginManager'
import { AbstractSessionModel, isAbstractMenuManager } from '@jbrowse/core/util'
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed'
import MultilevelLinearViewF from './MultilevelLinearView'
import LinearGenomeMultilevelViewF from './LinearGenomeMultilevelView'
import { version } from '../package.json'

export default class extends Plugin {
  name = 'MultilevelLinearViewPlugin'
  version = version

  install(pluginManager: PluginManager) {
    pluginManager.addViewType(() =>
      pluginManager.jbrequire(LinearGenomeMultilevelViewF),
    )
    pluginManager.addViewType(() =>
      pluginManager.jbrequire(MultilevelLinearViewF),
    )
  }

  configure(pluginManager: PluginManager) {
    if (isAbstractMenuManager(pluginManager.rootModel)) {
      pluginManager.rootModel.appendToMenu('Add', {
        label: 'Linear multilevel view',
        icon: DynamicFeedIcon,
        onClick: (session: AbstractSessionModel) => {
          session.addView('MultilevelLinearView', {})
        },
      })
    }
  }
}
