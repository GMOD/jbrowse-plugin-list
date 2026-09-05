import { types } from '@jbrowse/mobx-state-tree'

import { extendPluggableStateModel } from '../extendStateModel'

import type { Protein1DLinkage } from './linkage'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { PluggableElementType } from '@jbrowse/core/pluggableElementTypes'
import type ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'
import type { IAnyModelType } from '@jbrowse/mobx-state-tree'

export type { Protein1DLinkage } from './linkage'
export {
  findProteinLinkedView,
  genomeHighlightForProteinPosition,
  getProteinLinkage,
  linkageGenomeMapping,
} from './linkage'

function isLinearGenomeView(elt: { name: string }): elt is ViewType {
  return elt.name === 'LinearGenomeView'
}

/**
 * Gives every LinearGenomeView an optional `proteinLinkage` property, set on
 * the 1D protein-annotation view when it is launched from a transcript. Living
 * on the view means it is serialized with the session and dies with the view.
 */
function withProteinLinkage(stateModel: IAnyModelType) {
  return stateModel.props({
    proteinLinkage: types.maybe(types.frozen<Protein1DLinkage>()),
  })
}

export default function Protein1DLinkageF(pluginManager: PluginManager) {
  pluginManager.addToExtensionPoint(
    'Core-extendPluggableElement',
    (elt: PluggableElementType) => {
      if (isLinearGenomeView(elt)) {
        extendPluggableStateModel(elt, withProteinLinkage)
      }
      return elt
    },
  )
}
