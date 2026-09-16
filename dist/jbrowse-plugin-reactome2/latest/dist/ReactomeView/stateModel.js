import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes/models';
import { types } from '@jbrowse/mobx-state-tree';
// BaseViewModel is read off the host, so the view carries whatever members the
// host's view container calls on it
const stateModel = types
    .compose('ReactomeView', BaseViewModel, types.model({
    type: types.literal('ReactomeView'),
    selectedPathway: types.maybe(types.string),
    gene: types.maybe(types.string),
    message: 'No pathways are currently displayed.',
}))
    .volatile(() => ({
    pathways: undefined,
}))
    .actions(self => ({
    setMessage(message) {
        self.message = message;
    },
    setSearchResult(gene, pathways) {
        var _a, _b;
        self.gene = gene;
        self.pathways = pathways;
        // the most specific pathway: DiagramJs draws a high-level one blank
        self.selectedPathway = (_b = ((_a = pathways.find(p => p.leaf)) !== null && _a !== void 0 ? _a : pathways[0])) === null || _b === void 0 ? void 0 : _b.stId;
        self.message = pathways.length
            ? `Pathways relating to ${gene} are being displayed. Click on a pathway to display it in the Reactome diagram viewer.`
            : `No pathways could be retrieved for ${gene}.`;
    },
    selectPathway({ stId, name }) {
        self.selectedPathway = stId;
        self.message = `Pathways relating to ${self.gene} are being displayed. "${name}" has been selected.`;
    },
}));
export default stateModel;
//# sourceMappingURL=stateModel.js.map