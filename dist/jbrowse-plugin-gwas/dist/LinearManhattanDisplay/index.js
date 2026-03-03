import { DisplayType } from '@jbrowse/core/pluggableElementTypes';
import { configSchemaFactory } from './configSchemaFactory';
import { stateModelFactory } from './stateModelFactory';
export default function LinearManhattanDisplayF(pluginManager) {
    const WigglePlugin = pluginManager.getPlugin('WigglePlugin');
    const { LinearWiggleDisplayReactComponent } = WigglePlugin.exports;
    pluginManager.addDisplayType(() => {
        const configSchema = configSchemaFactory(pluginManager);
        return new DisplayType({
            name: 'LinearManhattanDisplay',
            configSchema,
            stateModel: stateModelFactory(pluginManager, configSchema),
            trackType: 'GWASTrack',
            viewType: 'LinearGenomeView',
            ReactComponent: LinearWiggleDisplayReactComponent,
        });
    });
}
//# sourceMappingURL=index.js.map