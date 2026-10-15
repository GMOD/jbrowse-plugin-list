import type { LaunchArgs } from './launchProteinView'
import type PluginManager from '@jbrowse/core/PluginManager'

/**
 * The launch itself loads on first use, so registering it costs the plugin's
 * boot nothing.
 */
export default function LaunchProteinViewExtensionPointF(
  pluginManager: PluginManager,
) {
  pluginManager.addToExtensionPoint(
    'LaunchView-ProteinView',
    async (args: LaunchArgs) => {
      const { launchProteinView } = await import('./launchProteinView')
      return launchProteinView(args)
    },
  )
}
