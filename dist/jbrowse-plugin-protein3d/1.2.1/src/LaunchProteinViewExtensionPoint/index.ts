import { coerceAlignmentAlgorithm, resolveStructureUrl } from 'p2s_mapper'

import { resolveGeneNameLaunch } from './findGeneByName'
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
  // a gene name, looked up in the assembly's text search index; alone it
  // launches the gene's AlphaFold model beside a genome view on the gene
  gene?: string
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
        connectedView: givenConnectedView,
        gene,
        sideBySide,
        initialSelection,
        initialResidues,
        initialTranscriptResidues,
        ...settings
      } = args
      const fail = (e: unknown) => {
        console.error(e)
        session.notify(`Could not launch protein view: ${e}`, 'error')
        return args
      }

      // A gene name alone: the host's text search finds the gene, and the
      // launch dialog's defaults pick its isoform and AlphaFold model. A
      // structure, transcript or locus the spec names wins over those.
      const namesStructure =
        !!url || !!uniprotId || !!pdbId || !!requestedStructures?.length
      let named: Awaited<ReturnType<typeof resolveGeneNameLaunch>> | undefined
      if (gene && !userProvidedTranscriptSequence) {
        try {
          named = await resolveGeneNameLaunch({
            session,
            gene,
            transcriptId,
            uniprotId,
            findStructure: !namesStructure,
            connectedView: givenConnectedView,
          })
        } catch (e) {
          return fail(e)
        }
      }
      const connectedView = connectedViewId
        ? givenConnectedView
        : (named?.connectedView ?? givenConnectedView)
      if (named && !namesStructure && !named.url) {
        return fail(
          new Error(
            named.uniprotId
              ? `AlphaFold DB has no model for ${named.uniprotId}, the UniProt entry of ${gene}; name a pdbId or url`
              : `no single UniProt entry found for ${gene}; name a uniprotId or pdbId`,
          ),
        )
      }
      const requested: LaunchStructure[] = requestedStructures?.length
        ? requestedStructures
        : [
            {
              url: url ?? (uniprotId || !pdbId ? named?.url : undefined),
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
        return fail(
          'No url, uniprotId, pdbId or gene provided when launching protein view',
        )
      }

      // Short form: a `transcriptId` plus a `connectedView` in place of an
      // explicit `feature` + sequence. resolveShortLaunch derives both from the
      // connected track, and the same mapping then applies to every structure
      // of the launch. Failures surface via notify and abort — we never leave a
      // half-wired view.
      let resolved: ResolvedShortLaunch | undefined = named
      if (!resolved && !userProvidedTranscriptSequence && transcriptId) {
        try {
          resolved = await resolveShortLaunch({
            session,
            transcriptId,
            connectedView,
          })
        } catch (e) {
          return fail(e)
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
              ...connectedView,
              type: 'LinearGenomeView',
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
        launchViewSnapshot(
          { displayName: named?.displayName, ...settings },
          structures,
        ),
      )

      if (ownsConnectedView) {
        maybeLaunchSideBySide(session, proteinView.id, sideBySide)
      }
      return args
    },
  )
}
