import { types } from '@jbrowse/mobx-state-tree';
export function stateModelFactory() {
    return types
        .model('MafSequenceWidget', {
        id: types.identifier,
        type: types.literal('MafSequenceWidget'),
        adapterConfig: types.frozen(undefined),
        samples: types.frozen(undefined),
        regions: types.frozen(undefined),
        connectedViewId: types.maybe(types.string),
    })
        .volatile(() => ({
        hoverHighlight: undefined,
    }))
        .actions(self => ({
        setHoverHighlight(highlight) {
            self.hoverHighlight = highlight;
        },
    }));
}
//# sourceMappingURL=stateModelFactory.js.map