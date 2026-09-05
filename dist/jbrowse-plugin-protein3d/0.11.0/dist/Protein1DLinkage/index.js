import { types } from '@jbrowse/mobx-state-tree';
import { extendPluggableStateModel } from '../extendStateModel';
export { findProteinLinkedView, genomeHighlightForProteinPosition, getProteinLinkage, linkageGenomeMapping, } from './linkage';
function isLinearGenomeView(elt) {
    return elt.name === 'LinearGenomeView';
}
/**
 * Gives every LinearGenomeView an optional `proteinLinkage` property, set on
 * the 1D protein-annotation view when it is launched from a transcript. Living
 * on the view means it is serialized with the session and dies with the view.
 */
function withProteinLinkage(stateModel) {
    return stateModel.props({
        proteinLinkage: types.maybe(types.frozen()),
    });
}
export default function Protein1DLinkageF(pluginManager) {
    pluginManager.addToExtensionPoint('Core-extendPluggableElement', (elt) => {
        if (isLinearGenomeView(elt)) {
            extendPluggableStateModel(elt, withProteinLinkage);
        }
        return elt;
    });
}
