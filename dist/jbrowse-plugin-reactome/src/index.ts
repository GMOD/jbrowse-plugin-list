import Plugin from '@jbrowse/core/Plugin'
import PluginManager from '@jbrowse/core/PluginManager'
import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'
import { AbstractSessionModel, isAbstractMenuManager } from '@jbrowse/core/util'
import { version } from '../package.json'
import {
  ReactComponent as ReactomeViewReactComponent,
  stateModel as reactomeViewStateModel,
} from './ReactomeView'
import ShowChartIcon from '@material-ui/icons/ShowChart'
export default class ReactomePlugin extends Plugin {
  name = 'ReactomePlugin'
  version = version

  install(pluginManager: PluginManager) {
    pluginManager.addViewType(() => {
      return new ViewType({
        name: 'ReactomeView',
        stateModel: reactomeViewStateModel,
        ReactComponent: ReactomeViewReactComponent,
      })
    })
  }

  configure(pluginManager: PluginManager) {
    if (isAbstractMenuManager(pluginManager.rootModel)) {
      pluginManager.rootModel.appendToMenu('Add', {
        label: 'Reactome View',
        icon: ShowChartIcon,
        onClick: (session: AbstractSessionModel) => {
          session.addView('ReactomeView', {})
          const xView = session.views.length - 1
          // @ts-ignore
          session.views[xView].setDisplayName('Reactome View')
        },
      })
    }
  }
}
