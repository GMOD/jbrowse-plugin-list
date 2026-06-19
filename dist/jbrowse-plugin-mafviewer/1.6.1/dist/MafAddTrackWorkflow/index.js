import { AddTrackWorkflowType } from '@jbrowse/core/pluggableElementTypes';
import { types } from '@jbrowse/mobx-state-tree';
import MultiMAFWidget from './AddTrackWorkflow';
export default function MafAddTrackWorkflowF(pluginManager) {
    pluginManager.addAddTrackWorkflowType(() => new AddTrackWorkflowType({
        name: 'MAF track',
        ReactComponent: MultiMAFWidget,
        stateModel: types.model({}),
    }));
}
//# sourceMappingURL=index.js.map