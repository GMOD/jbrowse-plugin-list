import { getSession } from '@jbrowse/core/util';
import { isAlive, types } from '@jbrowse/mobx-state-tree';
import { makeCoordinateMapper } from 'p2s_mapper';
import { linkageGenomeMapping, resolveLinkageAlignment } from './linkage';
import { sessionLinkageHost } from './sessionLinkageHost';
export { findProteinLinkedViews, genomeHighlightsForUniProtPosition, getProteinLinkage, hovered1DProteinPosition, } from './linkage';
function isLinearGenomeView(elt) {
    return elt.name === 'LinearGenomeView';
}
/**
 * Gives every LinearGenomeView an optional `proteinLinkage` property, set on
 * the 1D protein-annotation view when it is launched from a transcript. Living
 * on the view means it is serialized with the session and dies with the view.
 * The transcript's genome mapping is a computed beside it, so the hover
 * bridges asking on every mouse move build it once. Its alignment to the
 * UniProt entry is worked out each time the view attaches and never saved.
 */
export function withProteinLinkage(stateModel) {
    return stateModel
        .props({
        proteinLinkage: types.maybe(types.frozen()),
    })
        .volatile(() => ({
        proteinLinkageAlignment: undefined,
    }))
        .views((self) => ({
        get proteinLinkageMapping() {
            return self.proteinLinkage
                ? linkageGenomeMapping(self.proteinLinkage)
                : undefined;
        },
        get proteinLinkageCoordinates() {
            return self.proteinLinkageAlignment
                ? makeCoordinateMapper(self.proteinLinkageAlignment)
                : undefined;
        },
    }))
        .actions((self) => ({
        setProteinLinkageAlignment(alignment) {
            self.proteinLinkageAlignment = alignment;
        },
    }))
        .actions((self) => ({
        afterAttach() {
            const linkage = self.proteinLinkage;
            if (linkage) {
                const session = getSession(self);
                const unlinked = (why) => {
                    session.notify(`The protein view of ${linkage.uniprotId} is not linked to the genome: ${why}`, 'warning');
                };
                resolveLinkageAlignment(sessionLinkageHost(session, linkage)).then(result => {
                    if (isAlive(self)) {
                        if ('alignment' in result) {
                            self.setProteinLinkageAlignment(result.alignment);
                        }
                        else {
                            unlinked(result.problem);
                        }
                    }
                }, (e) => {
                    if (isAlive(self)) {
                        console.error(e);
                        unlinked(`${e}`);
                    }
                });
            }
        },
    }));
}
export default function Protein1DLinkageF(pluginManager) {
    pluginManager.addToExtensionPoint('Core-extendPluggableElement', (elt) => {
        if (isLinearGenomeView(elt)) {
            elt.extendStateModel(withProteinLinkage);
        }
        return elt;
    });
}
