import { types } from '@jbrowse/mobx-state-tree';
import { extendPluggableStateModel } from '../extendStateModel';
import { linkageGenomeMapping } from './linkage';
export { findProteinLinkedView, genomeHighlightsForProteinPosition, getProteinLinkage, getProteinLinkageMapping, hovered1DProteinPosition, } from './linkage';
function isLinearGenomeView(elt) {
    return elt.name === 'LinearGenomeView';
}
/**
 * Gives every LinearGenomeView an optional `proteinLinkage` property, set on
 * the 1D protein-annotation view when it is launched from a transcript. Living
 * on the view means it is serialized with the session and dies with the view.
 * The transcript's genome mapping is a computed beside it, so the hover
 * bridges asking on every mouse move build it once.
 */
export function withProteinLinkage(stateModel) {
    return stateModel
        .props({
        proteinLinkage: types.maybe(types.frozen()),
    })
        .views((self) => ({
        get proteinLinkageMapping() {
            return self.proteinLinkage
                ? linkageGenomeMapping(self.proteinLinkage)
                : undefined;
        },
    }));
}
export default function Protein1DLinkageF(pluginManager) {
    pluginManager.addToExtensionPoint('Core-extendPluggableElement', (elt) => {
        if (isLinearGenomeView(elt)) {
            extendPluggableStateModel(elt, withProteinLinkage);
        }
        return elt;
    });
}
