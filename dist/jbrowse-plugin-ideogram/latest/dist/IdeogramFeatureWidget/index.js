import { ConfigurationSchema } from '@jbrowse/core/configuration';
import { ElementId } from '@jbrowse/core/util/types/mst';
import { types } from '@jbrowse/mobx-state-tree';
import ReactComponent from './IdeogramFeatureWidget';
export default (pluginManager) => {
    const configSchema = ConfigurationSchema('IdeogramFeatureWidget', {});
    const stateModel = types
        .model('IdeogramFeatureWidget', {
        id: ElementId,
        type: types.literal('IdeogramFeatureWidget'),
        featureData: types.frozen({}),
        view: types.safeReference(pluginManager.pluggableMstType('view', 'stateModel')),
    })
        .actions(self => ({
        setFeatureData(data) {
            self.featureData = data;
        },
        clearFeatureData() {
            self.featureData = {};
        },
        hasPlugin(name) {
            return pluginManager.hasPlugin(name);
        },
    }));
    return { configSchema, stateModel, ReactComponent };
};
//# sourceMappingURL=index.js.map