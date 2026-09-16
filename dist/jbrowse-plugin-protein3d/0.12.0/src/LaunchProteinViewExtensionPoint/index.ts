import { coerceAlignmentAlgorithm, resolveStructureUrl } from 'p2s_mapper'

import {
  type ConnectedViewSpec,
  type ResolvedShortLaunch,
  resolveShortLaunch,
} from './resolveShortLaunch'
import { maybeLaunchSideBySide } from '../LaunchProteinView/utils/sideBySide'
import { coerceColorScheme } from '../ProteinView/applyColorTheme'
import { proteinViewSnapshot } from '../ProteinView/proteinViewSpec'

import type { ProteinStructureSpec } from '../ProteinView/proteinViewSpec'
import type PluginManager from '@jbrowse/core/PluginManager'
import type {
  AbstractSessionModel,
  SimpleFeatureSerialized,
} from '@jbrowse/core/util'
import type { InitState } from '@jbrowse/plugin-linear-genome-view'

// One structure of a launch: where it comes from, plus the per-structure
// settings a spec may carry. The transcript mapping is shared across all of
// them and comes from the launch's own transcriptId/feature/sequence.
interface LaunchStructure {
  url?: string
  data?: string
  uniprotId?: string
  pdbId?: string
  initialSelection?: { start: number; end: number }
  initialResidues?: { start: number; end: number }
  initialTranscriptResidues?: { start: number; end: number }
  mappedEntityId?: string
  // per-structure mapping, overriding the launch-wide one below
  userProvidedTranscriptSequence?: string
  feature?: SimpleFeatureSerialized
  connectedViewId?: string
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
      colorScheme?: string
      displayName?: string
      height?: number
      showControls?: boolean
      showHighlight?: boolean
      showAlignment?: boolean
      showProteinTracks?: boolean
      compactTracks?: boolean
      autoScrollAlignment?: boolean
      zoomToBaseLevel?: boolean
      // when this launch creates its own connected genome view, place the
      // protein view side-by-side (left genome | right protein). Explicit
      // override; falls back to the launch-dialog localStorage preference.
      sideBySide?: boolean
      // 0-based half-open structure-residue range to pre-select on load, lit
      // across the 3D structure, connected genome view, and alignment exactly
      // as a domain click would — so a spec can open with a domain highlighted.
      initialSelection?: { start: number; end: number }
      // the same, by inclusive author residue numbers (R248 is 248-248)
      initialResidues?: { start: number; end: number }
      // the same, by 1-based inclusive residues of the transcript's translation
      initialTranscriptResidues?: { start: number; end: number }
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
        colorScheme,
        displayName,
        height,
        showControls,
        showHighlight,
        showAlignment,
        showProteinTracks,
        compactTracks,
        autoScrollAlignment,
        zoomToBaseLevel,
        sideBySide,
        initialSelection,
        initialResidues,
        initialTranscriptResidues,
      } = args
      const requested: LaunchStructure[] = args.structures?.length
        ? args.structures
        : [
            {
              url,
              uniprotId,
              pdbId,
              initialSelection,
              initialResidues,
              initialTranscriptResidues,
            },
          ]
      const urls = requested.map(s => resolveStructureUrl(s))
      const primary = requested[0]!
      const primaryUrl = urls[0]
      if (
        !primaryUrl &&
        primary.data === undefined &&
        primary.uniprotId === undefined
      ) {
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
      if (!userProvidedTranscriptSequence && transcriptId) {
        try {
          resolved = await resolveShortLaunch({
            session,
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
              // a spec's connectedView is unvalidated json, so a missing
              // assembly reaches the view and is reported there, as before
              init: connectedView as InitState,
            }).id
          : undefined)

      const structures: ProteinStructureSpec[] = requested.map((s, i) => ({
        url: urls[i],
        uniprotId: s.uniprotId,
        data: s.data,
        initialSelection: s.initialSelection,
        initialResidues: s.initialResidues,
        initialTranscriptResidues: s.initialTranscriptResidues,
        mappedEntityId: s.mappedEntityId,
        userProvidedTranscriptSequence:
          s.userProvidedTranscriptSequence ??
          resolved?.userProvidedTranscriptSequence ??
          userProvidedTranscriptSequence,
        feature: s.feature ?? resolved?.feature ?? feature,
        connectedViewId: s.connectedViewId ?? resolvedConnectedViewId,
      }))

      const proteinView = session.addView(
        'ProteinView',
        proteinViewSnapshot({
          // a URL param is untrusted text; the model properties are enumerations
          alignmentAlgorithm:
            alignmentAlgorithm === undefined
              ? undefined
              : coerceAlignmentAlgorithm(alignmentAlgorithm),
          colorScheme:
            colorScheme === undefined
              ? undefined
              : coerceColorScheme(colorScheme),
          displayName,
          height,
          showControls,
          showHighlight,
          showAlignment,
          showProteinTracks,
          compactTracks,
          autoScrollAlignment,
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
