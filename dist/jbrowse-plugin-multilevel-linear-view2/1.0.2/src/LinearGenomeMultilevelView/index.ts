import PluginManager from '@jbrowse/core/PluginManager'
import modelFactory from './model'
import ReactComponent from './components/LinearGenomeMultilevelView'

export default ({ jbrequire }: PluginManager) => {
  const ViewType = jbrequire('@jbrowse/core/pluggableElementTypes/ViewType')
  return new ViewType({
    name: 'LinearGenomeMultilevelView',
    stateModel: jbrequire(modelFactory),
    ReactComponent,
    extendedName: 'LinearGenomeView',
  })
}
