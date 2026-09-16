import Plugin from '@jbrowse/core/Plugin'
import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'
import { isAbstractMenuManager } from '@jbrowse/core/util'
import ShowChartIcon from '@mui/icons-material/ShowChart'

import { ReactComponent, stateModel } from './ReactomeView'
import { version } from './version'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { AbstractSessionModel } from '@jbrowse/core/util'

export default class ReactomePlugin extends Plugin {
  name = 'ReactomePlugin'
  version = version

  install(pluginManager: PluginManager) {
    pluginManager.addViewType(
      () =>
        new ViewType({
          name: 'ReactomeView',
          stateModel,
          ReactComponent,
        }),
    )
  }

  configure(pluginManager: PluginManager) {
    if (isAbstractMenuManager(pluginManager.rootModel)) {
      pluginManager.rootModel.appendToMenu('Add', {
        label: 'Reactome view',
        icon: ShowChartIcon,
        onClick: (session: AbstractSessionModel) => {
          session.addView('ReactomeView', { displayName: 'Reactome View' })
        },
      })
    }
  }
}
