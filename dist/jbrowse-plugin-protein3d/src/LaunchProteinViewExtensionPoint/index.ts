import type PluginManager from '@jbrowse/core/PluginManager'
import type { AbstractSessionModel } from '@jbrowse/core/util'

export default function LaunchProteinViewExtensionPointF(
  pluginManager: PluginManager,
) {
  pluginManager.addToExtensionPoint(
    'LaunchView-ProteinView',
    // @ts-expect-error
    async ({
      session,
      url,
      userProvidedTranscriptSequence,
      feature,
      connectedViewId,
      alignmentAlgorithm,
      displayName,
      height,
      showControls,
      showHighlight,
      zoomToBaseLevel,
    }: {
      session: AbstractSessionModel
      url?: string
      userProvidedTranscriptSequence?: string
      feature?: Record<string, unknown>
      connectedViewId?: string
      alignmentAlgorithm?: string
      displayName?: string
      height?: number
      showControls?: boolean
      showHighlight?: boolean
      zoomToBaseLevel?: boolean
    }) => {
      if (!url) {
        throw new Error('No URL provided when launching protein view')
      }

      session.addView('ProteinView', {
        type: 'ProteinView',
        alignmentAlgorithm,
        displayName,
        height,
        showControls,
        showHighlight,
        zoomToBaseLevel,
        structures: [
          {
            url,
            userProvidedTranscriptSequence:
              userProvidedTranscriptSequence ?? '',
            feature,
            connectedViewId,
          },
        ],
      })
    },
  )
}
