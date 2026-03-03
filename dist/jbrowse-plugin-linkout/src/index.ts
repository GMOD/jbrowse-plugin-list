import Plugin from '@jbrowse/core/Plugin'
import PluginManager from '@jbrowse/core/PluginManager'
import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'
import { AbstractSessionModel, isAbstractMenuManager } from '@jbrowse/core/util'
import { version } from '../package.json'
import {
  ReactComponent as HelloViewReactComponent,
  stateModel as helloViewStateModel,
} from './HelloView'
import { getSession } from '@jbrowse/core/util'
import { string } from 'mobx-state-tree/dist/internal'
import console from 'console'

export default class TestPlugin extends Plugin {
  name = "Linkout"
  version = version

  install(pluginManager: PluginManager) {
    pluginManager.addViewType(() => {
      return new ViewType({
        name: 'HelloView',
        stateModel: helloViewStateModel,
        ReactComponent: HelloViewReactComponent,
      })
    })
  }

  configure(pluginManager: PluginManager) {
    // Add a new function called 'linkout' to the plugin manager's Jexl engine
    pluginManager.jexl.addFunction('linkout', (dict: Record<string, string>, feature: { dbxref: any }) => {
      if (!feature.dbxref) {  // If the feature has no dbxref, return an empty string
        return ''
      }
      
      const dbxrefs = Array.isArray(feature.dbxref)  // Convert the dbxref(s) to an array, if necessary
        ? feature.dbxref
        : [feature.dbxref]

      // Map over the array of dbxrefs and create an HTML link for each one, using the root and content of the dbxref
      return dbxrefs.map(dbxref => {
        const [root, content1, content2] = dbxref.split(':')
        const link = dict[root]  // Look up the link URL in the dictionary using the root of the dbxref
        return content2 ? `<a href=${link}${content1}:${content2}>${dbxref}</a>` : `<a href=${link}${content1}>${dbxref}</a>`  
      })
    })

    if (isAbstractMenuManager(pluginManager.rootModel)) {
      pluginManager.rootModel.appendToMenu('Add', {
        label: 'Hello View',
        onClick: (session: AbstractSessionModel) => {
          session.addView('HelloView', {})
        },
      })
    }
  }
}