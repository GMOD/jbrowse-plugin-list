import type { AnnotationLaunchArgs } from './launchAnnotationView'
import type PluginManager from '@jbrowse/core/PluginManager'

/**
 * The 1D protein-annotation view of a UniProt entry, from a session spec:
 * the same view the launch dialog's 1D option opens, linked to the transcript
 * a `gene` or `transcriptId` names the way a ProteinView spec links its
 * structures. The view itself is a LinearGenomeView on a temporary assembly,
 * so the extension point is named for the spec type rather than the view type.
 *
 * The launch itself loads on first use, so registering it costs the plugin's
 * boot nothing.
 */
export default function LaunchProteinAnnotationViewF(
  pluginManager: PluginManager,
) {
  pluginManager.addToExtensionPoint(
    'LaunchView-ProteinAnnotationView',
    async (args: AnnotationLaunchArgs) => {
      const { launchAnnotationView } = await import('./launchAnnotationView')
      return launchAnnotationView(args)
    },
  )
}
