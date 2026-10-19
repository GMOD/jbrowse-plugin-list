/**
 * The launch itself loads on first use, so registering it costs the plugin's
 * boot nothing.
 */
export default function LaunchProteinViewExtensionPointF(pluginManager) {
    pluginManager.addToExtensionPoint('LaunchView-ProteinView', async (args) => {
        const { launchProteinView } = await import('./launchProteinView');
        return launchProteinView(args);
    });
}
