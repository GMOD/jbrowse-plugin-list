import { ConfigurationSchema } from '@jbrowse/core/configuration';
const linearGDCDisplayConfigSchema = (pluginManager) => {
    const { baseLinearDisplayConfigSchema } = pluginManager.getPlugin('LinearGenomeViewPlugin').exports;
    return ConfigurationSchema('LinearGDCDisplay', { renderer: pluginManager.pluggableConfigSchemaType('renderer') }, { baseConfiguration: baseLinearDisplayConfigSchema, explicitlyTyped: true });
};
export default linearGDCDisplayConfigSchema;
//# sourceMappingURL=configSchema.js.map