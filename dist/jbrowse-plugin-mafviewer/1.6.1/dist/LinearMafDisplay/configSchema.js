import { ConfigurationSchema } from '@jbrowse/core/configuration';
export default function configSchemaF(pluginManager) {
    const LinearGenomePlugin = pluginManager.getPlugin('LinearGenomeViewPlugin');
    const { baseLinearDisplayConfigSchema } = LinearGenomePlugin.exports;
    return ConfigurationSchema('LinearMafDisplay', {
        /**
         * #slot
         */
        renderer: pluginManager.pluggableConfigSchemaType('renderer'),
    }, {
        baseConfiguration: baseLinearDisplayConfigSchema,
        explicitlyTyped: true,
    });
}
//# sourceMappingURL=configSchema.js.map