import PluginManager from '@jbrowse/core/PluginManager'
import modelFactory from './model'
import ReactComponent from './components/MultilevelLinearView'

export default ({ jbrequire }: PluginManager) => {
  const ViewType = jbrequire('@jbrowse/core/pluggableElementTypes/ViewType')
  return new ViewType({
    name: 'MultilevelLinearView',
    stateModel: jbrequire(modelFactory),
    ReactComponent,
  })
}
