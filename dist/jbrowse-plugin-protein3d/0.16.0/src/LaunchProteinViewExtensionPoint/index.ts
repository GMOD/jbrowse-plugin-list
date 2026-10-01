import { coerceAlignmentAlgorithm, resolveStructureUrl } from 'p2s_mapper'

import {
  type ConnectedViewSpec,
  type ResolvedShortLaunch,
  resolveShortLaunch,
} from './resolveShortLaunch'
import { maybeLaunchSideBySide } from '../LaunchProteinView/utils/sideBySide'
import { coerceColorScheme } from '../ProteinView/applyColorTheme'
import { proteinViewSnapshot } from '../ProteinView/proteinViewSpec'

import type {
  ProteinStructureSpec,
  ProteinViewSpec,
} from '../ProteinView/proteinViewSpec'
import type { ResidueRanges } from '../ProteinView/residueRanges'
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
  initialSelection?: ResidueRanges
  initialResidues?: ResidueRanges
  initialTranscriptResidues?: ResidueRanges
  mappedEntityId?: string
  // per-structure mapping, overriding the launch-wide one below
  userProvidedTranscriptSequence?: string
  feature?: SimpleFeatureSerialized
  connectedViewId?: string
}

// The view's own settings, which pass straight through to its snapshot, so a
// setting ProteinViewSpec gains reaches a launch without being listed here too.
// Listing them was how `showAllFeatureTracks` came to be dropped.
interface LaunchViewSettings extends Omit<
  ProteinViewSpec,
  'structures' | 'colorScheme' | 'alignmentAlgorithm'
> {
  // untrusted text from a URL, coerced to the model's enumerations
  alignmentAlgorithm?: string
  colorScheme?: string
}

export function launchViewSnapshot(
  { alignmentAlgorithm, colorScheme, ...settings }: LaunchViewSettings,
  structures: ProteinStructureSpec[],
) {
  return proteinViewSnapshot({
    ...settings,
    alignmentAlgorithm:
      alignmentAlgorithm === undefined
        ? undefined
        : coerceAlignmentAlgorithm(alignmentAlgorithm),
    colorScheme:
      colorScheme === undefined ? undefined : coerceColorScheme(colorScheme),
    structures,
  })
}

interface LaunchArgs extends LaunchViewSettings {
  session: AbstractSessionModel
  url?: string
  uniprotId?: string
  // RCSB entry id, the experimental-structure counterpart of uniprotId
  pdbId?: string
  // several structures in one view, each mapped to the same transcript and
  // superposed; the top-level url/uniprotId/pdbId is the one-structure
  // shorthand for this
  structures?: LaunchStructure[]
  transcriptId?: string
  userProvidedTranscriptSequence?: string
  feature?: SimpleFeatureSerialized
  connectedViewId?: string
  connectedView?: ConnectedViewSpec
  // when this launch creates its own connected genome view, place the protein
  // view side-by-side (left genome | right protein). Explicit override; falls
  // back to the launch-dialog localStorage preference.
  sideBySide?: boolean
  // 0-based half-open structure-residue ranges, one or an array, to pre-select
  // on load, lit across the 3D structure, connected genome view and alignment
  // as a domain click would
  initialSelection?: ResidueRanges
  // the same, by inclusive author residue numbers (R248 is 248-248)
  initialResidues?: ResidueRanges
  // the same, by 1-based inclusive residues of the transcript's translation
  initialTranscriptResidues?: ResidueRanges
}

export default function LaunchProteinViewExtensionPointF(
  pluginManager: PluginManager,
) {
  // v4 hosts declare `init`; v5 reads the settings off the view object and
  // warns about the nesting
  const lgvTakesInit = () =>
    'init' in
    pluginManager.getViewType('LinearGenomeView').stateModel.properties

  pluginManager.addToExtensionPoint(
    'LaunchView-ProteinView',
    // A LaunchView point is a transformer — the chain hands what each callback
    // returns to the next — and JBrowse now warns when one returns undefined
    // ("...returned undefined instead of the value it was passed, so its result
    // was ignored"), on every launch. This used to return nothing on the
    // assumption that the result was ignored; it is not. The handler returns
    // its extendee at each exit now, like jbrowse-components' own
    // LaunchDotplotView does.
    async (args: LaunchArgs) => {
      const {
        session,
        url,
        uniprotId,
        pdbId,
        structures: requestedStructures,
        transcriptId,
        userProvidedTranscriptSequence,
        feature,
        connectedViewId,
        connectedView,
        sideBySide,
        initialSelection,
        initialResidues,
        initialTranscriptResidues,
        ...settings
      } = args
      const requested: LaunchStructure[] = requestedStructures?.length
        ? requestedStructures
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
      // half-wired view.
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
          ? session.addView(
              'LinearGenomeView',
              lgvTakesInit()
                ? { type: 'LinearGenomeView', init: connectedView as InitState }
                : { ...connectedView, type: 'LinearGenomeView' },
            ).id
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
        launchViewSnapshot(settings, structures),
      )

      if (ownsConnectedView) {
        maybeLaunchSideBySide(session, proteinView.id, sideBySide)
      }
      return args
    },
  )
}
