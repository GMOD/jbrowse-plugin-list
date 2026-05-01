import { ElementId } from '@jbrowse/core/util/types/mst';
import { types } from '@jbrowse/mobx-state-tree';
export default function f(_pluginManager) {
    return types
        .model('GDCSearchWidget', {
        id: ElementId,
        type: types.literal('GDCSearchWidget'),
    })
        .volatile(() => ({
        trackData: undefined,
        indexTrackData: undefined,
    }))
        .actions(self => ({
        setTrackData(obj) {
            self.trackData = obj;
        },
        setIndexTrackData(obj) {
            self.indexTrackData = obj;
        },
        clearData() {
            self.indexTrackData = undefined;
            self.trackData = undefined;
        },
    }));
}
//# sourceMappingURL=model.js.map