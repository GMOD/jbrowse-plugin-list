import configSchemaF from './configSchema';
import modelF from './model';
const linearGDCDisplayPlugin = (pluginManager) => {
    const schema = configSchemaF(pluginManager);
    return {
        configSchema: schema,
        stateModel: modelF(pluginManager, schema),
    };
};
export default linearGDCDisplayPlugin;
//# sourceMappingURL=index.js.map