import {
  type ConnectedViewSpec,
  type ResolvedShortLaunch,
  resolveShortLaunch,
} from './resolveShortLaunch'
import { maybeLaunchSideBySide } from '../LaunchProteinView/utils/sideBySide'
import { resolveStructureUrl } from '../LaunchProteinView/utils/structureUrls'
import { proteinViewSnapshot } from '../ProteinView/proteinViewSpec'
import { coerceAlignmentAlgorithm } from '../ProteinView/types'

import type { ProteinStructureSpec } from '../ProteinView/proteinViewSpec'
import type PluginManager from '@jbrowse/core/PluginManager'
import type {
  AbstractSessionModel,
  SimpleFeatureSerialized,
} from '@jbrowse/core/util'

// One structure of a launch: where it comes from, plus the per-structure
// settings a spec may carry. The transcript mapping is shared across all of
// them and comes from the launch's own transcriptId/feature/sequence.
interface LaunchStructure {
  url?: string
  data?: string
  uniprotId?: string
  pdbId?: string
  initialSelection?: { start: number; end: number }
  mappedEntityId?: string
}

// What a structure is called in the view's title: the id it was asked for by,
// else the file's name.
function structureLabel(s: LaunchStructure) {
  return s.uniprotId ?? s.pdbId ?? s.url?.split('/').pop()?.split('?')[0] ?? ''
}

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
      // several structures in one view, each mapped to the same transcript
      // and superposed; the top-level url/uniprotId/pdbId is the one-structure
      // shorthand for this
      structures?: LaunchStructure[]
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
      const requested: LaunchStructure[] = args.structures?.length
        ? args.structures
        : [{ url, uniprotId, pdbId, initialSelection }]
      const urls = requested.map(s => resolveStructureUrl(s))
      const primary = requested[0]!
      const primaryUrl = urls[0]
      if (!primaryUrl && primary.data === undefined) {
        const message =
          'No url, uniprotId or pdbId provided when launching protein view'
        console.error(message)
        session.notify(`Could not launch protein view: ${message}`, 'error')
        return args
      }

      // Short form: a `transcriptId` plus a `connectedView` in place of an
      // explicit `feature` + sequence. resolveShortLaunch derives both from the
      // connected track, and the same mapping then applies to every structure
      // of the launch. Failures surface via notify and abort — we never leave a
      // half-wired view (see agent-docs/urlparam_plan.md).
      let resolved: ResolvedShortLaunch | undefined
      if (!userProvidedTranscriptSequence && transcriptId && primaryUrl) {
        try {
          resolved = await resolveShortLaunch({
            session,
            structureUrl: primaryUrl,
            transcriptId,
            connectedView,
          })
        } catch (e) {
          console.error(e)
          session.notify(`Could not launch protein view: ${e}`, 'error')
          return args
        }
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

      const structures: ProteinStructureSpec[] = requested.map((s, i) => ({
        url: urls[i],
        data: s.data,
        initialSelection: s.initialSelection,
        mappedEntityId: s.mappedEntityId,
        userProvidedTranscriptSequence:
          resolved?.userProvidedTranscriptSequence ??
          userProvidedTranscriptSequence,
        feature: resolved?.feature ?? feature,
        connectedViewId: resolvedConnectedViewId,
      }))

      const featureName = resolved?.feature.name ?? feature?.name
      const transcriptName =
        typeof featureName === 'string' ? featureName : transcriptId
      const proteinView = session.addView(
        'ProteinView',
        proteinViewSnapshot({
          // a URL param is untrusted text; the model property is an enumeration
          alignmentAlgorithm:
            alignmentAlgorithm === undefined
              ? undefined
              : coerceAlignmentAlgorithm(alignmentAlgorithm),
          displayName:
            displayName ??
            ['Protein view', transcriptName, ...requested.map(structureLabel)]
              .filter(s => !!s)
              .join(' - '),
          height,
          showControls,
          showHighlight,
          zoomToBaseLevel,
          structures,
        }),
      )

      if (ownsConnectedView) {
        maybeLaunchSideBySide(session, proteinView.id, sideBySide)
      }
      return args
    },
  )
}
