import { type ConnectedViewSpec, resolveShortLaunch } from './resolveShortLaunch'
import { maybeLaunchSideBySide } from '../LaunchProteinView/utils/sideBySide'
import { proteinViewSnapshot } from '../ProteinView/proteinViewSpec'

import type PluginManager from '@jbrowse/core/PluginManager'
import type {
  AbstractSessionModel,
  SimpleFeatureSerialized,
} from '@jbrowse/core/util'

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
      sideBySide,
      initialSelection,
    }: {
      session: AbstractSessionModel
      url?: string
      uniprotId?: string
      transcriptId?: string
      userProvidedTranscriptSequence?: string
      feature?: SimpleFeatureSerialized
      connectedViewId?: string
      connectedView?: ConnectedViewSpec
      alignmentAlgorithm?: string
      displayName?: string
      height?: number
      showControls?: boolean
      showHighlight?: boolean
      zoomToBaseLevel?: boolean
      // when this launch creates its own connected genome view, place the
      // protein view side-by-side (left genome | right protein). Explicit
      // override; falls back to the launch-dialog localStorage preference.
      sideBySide?: boolean
      // 0-based half-open structure-residue range to pre-select on load, lit
      // across the 3D structure, connected genome view, and alignment exactly
      // as a domain click would — so a spec can open with a domain highlighted.
      initialSelection?: { start: number; end: number }
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
        const message =
          'No url or uniprotId provided when launching protein view'
        console.error(message)
        session.notify(`Could not launch protein view: ${message}`, 'error')
        return
      }

      // A session spec launches each view independently with an auto-generated
      // id, so it cannot pre-compute a connectedViewId to cross-reference. When
      // `connectedView` is supplied we create the LinearGenomeView here and wire
      // its id, letting a single spec entry produce a connected genome+protein
      // pair (e.g. hover a variant to highlight the residue).
      // a connected view this launch created itself can be split beside the
      // protein view; a pre-existing connectedViewId is left in place
      const ownsConnectedView = !connectedViewId && !!connectedView
      const resolvedConnectedViewId =
        connectedViewId ??
        (connectedView
          ? session.addView('LinearGenomeView', {
              type: 'LinearGenomeView',
              init: connectedView,
            }).id
          : undefined)

      const proteinView = session.addView(
        'ProteinView',
        proteinViewSnapshot({
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
                userProvidedTranscriptSequence,
              feature: resolved?.feature ?? feature,
              connectedViewId: resolvedConnectedViewId,
              initialSelection,
            },
          ],
        }),
      )

      if (ownsConnectedView) {
        maybeLaunchSideBySide(session, proteinView.id, sideBySide)
      }
    },
  )
}
