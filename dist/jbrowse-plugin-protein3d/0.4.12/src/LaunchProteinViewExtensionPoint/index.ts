import { type ConnectedViewSpec, resolveShortLaunch } from './resolveShortLaunch'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { AbstractSessionModel } from '@jbrowse/core/util'

export default function LaunchProteinViewExtensionPointF(
  pluginManager: PluginManager,
) {
  pluginManager.addToExtensionPoint(
    'LaunchView-ProteinView',
    // LaunchView extension points are typed as transformers `(extendee, props)
    // => extendee`, but in practice JBrowse invokes them as side-effect
    // handlers and ignores the return value. Casting away the signature
    // mismatch rather than fabricating a fake return.
    // @ts-expect-error
    async ({
      session,
      url,
      uniprotId,
      transcriptId,
      userProvidedTranscriptSequence,
      feature,
      connectedViewId,
      connectedView,
      alignmentAlgorithm,
      displayName,
      height,
      showControls,
      showHighlight,
      zoomToBaseLevel,
    }: {
      session: AbstractSessionModel
      url?: string
      uniprotId?: string
      transcriptId?: string
      userProvidedTranscriptSequence?: string
      feature?: Record<string, unknown>
      connectedViewId?: string
      connectedView?: ConnectedViewSpec
      alignmentAlgorithm?: string
      displayName?: string
      height?: number
      showControls?: boolean
      showHighlight?: boolean
      zoomToBaseLevel?: boolean
    }) => {
      // Short-URL form: `uniprotId` + `transcriptId` + `connectedView` (no
      // explicit `url`/`feature`/sequence). Derive the structure URL, the
      // transcript feature, and the translated sequence from the connected
      // track. Failures surface via notify and abort — we never leave a
      // half-wired view (see agent-docs/urlparam_plan.md).
      let resolved
      if (!url && uniprotId) {
        try {
          resolved = await resolveShortLaunch({
            session,
            uniprotId,
            transcriptId,
            connectedView,
          })
        } catch (e) {
          console.error(e)
          session.notify(`Could not launch protein view: ${e}`, 'error')
          return
        }
      }

      const finalUrl = url ?? resolved?.url
      if (!finalUrl) {
        throw new Error(
          'No url or uniprotId provided when launching protein view',
        )
      }

      // A session spec launches each view independently with an auto-generated
      // id, so it cannot pre-compute a connectedViewId to cross-reference. When
      // `connectedView` is supplied we create the LinearGenomeView here and wire
      // its id, letting a single spec entry produce a connected genome+protein
      // pair (e.g. hover a variant to highlight the residue).
      const resolvedConnectedViewId =
        connectedViewId ??
        (connectedView
          ? session.addView('LinearGenomeView', {
              type: 'LinearGenomeView',
              init: connectedView,
            }).id
          : undefined)

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
            url: finalUrl,
            userProvidedTranscriptSequence:
              resolved?.userProvidedTranscriptSequence ??
              userProvidedTranscriptSequence ??
              '',
            feature: resolved?.feature ?? feature,
            connectedViewId: resolvedConnectedViewId,
          },
        ],
      })
    },
  )
}
