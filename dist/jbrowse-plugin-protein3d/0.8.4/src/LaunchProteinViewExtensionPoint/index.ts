import {
  type ConnectedViewSpec,
  resolveShortLaunch,
} from './resolveShortLaunch'
import { maybeLaunchSideBySide } from '../LaunchProteinView/utils/sideBySide'
import { resolveStructureUrl } from '../LaunchProteinView/utils/structureUrls'
import { proteinViewSnapshot } from '../ProteinView/proteinViewSpec'
import { coerceAlignmentAlgorithm } from '../ProteinView/types'

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
    // A LaunchView point is a transformer — the chain hands what each callback
    // returns to the next — and JBrowse now warns when one returns undefined
    // ("...returned undefined instead of the value it was passed, so its result
    // was ignored"), on every launch. This used to return nothing on the
    // assumption that the result was ignored; it is not. The handler returns
    // its extendee at each exit now, like jbrowse-components' own
    // LaunchDotplotView does.
    //
    // The suppression stays, and is NOT about the return value: this builds
    // against @jbrowse/core 4.3.0, whose signature is `(extendee: T, props) => T`
    // with no `| Promise<T>` and no ExtensionPointRegistry, so an async handler
    // cannot be typed against it at all. jbrowse-components has since widened
    // that signature; drop the suppression when the core dependency is bumped
    // past it, not before.
    // @ts-expect-error
    async (args: {
      session: AbstractSessionModel
      url?: string
      uniprotId?: string
      // RCSB entry id, the experimental-structure counterpart of uniprotId
      pdbId?: string
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
      const {
        session,
        url,
        uniprotId,
        pdbId,
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
      } = args
      // Short-URL form: `uniprotId` (AlphaFold) or `pdbId` (RCSB) plus
      // `transcriptId` + `connectedView`, with no explicit
      // `url`/`feature`/sequence. resolveStructureUrl turns the shorthand into
      // a structure URL — the same precedence the Structure model applies to a
      // snapshot — and resolveShortLaunch derives the transcript feature and
      // the translated sequence from the connected track. Failures surface via
      // notify and abort — we never leave a half-wired view (see
      // agent-docs/urlparam_plan.md).
      const shorthandUrl = resolveStructureUrl({ url, uniprotId, pdbId })
      let resolved
      if (!url && shorthandUrl) {
        try {
          resolved = await resolveShortLaunch({
            session,
            structureUrl: shorthandUrl,
            transcriptId,
            connectedView,
          })
        } catch (e) {
          console.error(e)
          session.notify(`Could not launch protein view: ${e}`, 'error')
          return args
        }
      }

      const finalUrl = url ?? resolved?.url
      if (!finalUrl) {
        const message =
          'No url, uniprotId or pdbId provided when launching protein view'
        console.error(message)
        session.notify(`Could not launch protein view: ${message}`, 'error')
        return args
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
          // a URL param is untrusted text; the model property is an enumeration
          alignmentAlgorithm:
            alignmentAlgorithm === undefined
              ? undefined
              : coerceAlignmentAlgorithm(alignmentAlgorithm),
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
      return args
    },
  )
}
