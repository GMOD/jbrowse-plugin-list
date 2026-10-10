import { coerceAlignmentAlgorithm } from 'p2s_mapper'

import { resolveGeneNameLaunch } from './findGeneByName'
import { normalizeLaunch } from './normalizeLaunch'
import {
  type ConnectedViewSpec,
  type ResolvedShortLaunch,
  resolveShortLaunch,
} from './resolveShortLaunch'
import { describeMissingStructure } from '../LaunchProteinView/resolveGeneLaunch'
import { maybeLaunchSideBySide } from '../LaunchProteinView/utils/sideBySide'
import { coerceColorScheme } from '../ProteinView/applyColorTheme'
import { proteinViewSnapshot } from '../ProteinView/proteinViewSpec'

import type { LaunchStructure } from './normalizeLaunch'
import type {
  ProteinStructureSpec,
  ProteinViewSpec,
} from '../ProteinView/proteinViewSpec'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { AbstractSessionModel } from '@jbrowse/core/util'

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

// The structure keys written on the launch itself are the one-structure
// shorthand, and `feature`, `userProvidedTranscriptSequence` and
// `connectedViewId` the defaults every entry of `structures` shares.
interface LaunchArgs extends LaunchViewSettings, ProteinStructureSpec {
  session: AbstractSessionModel
  structures?: LaunchStructure[]
  // a gene name, looked up in the assembly's text search index; alone it
  // launches the gene's AlphaFold model beside a genome view on the gene
  gene?: string
  transcriptId?: string
  connectedView?: ConnectedViewSpec
  // when this launch creates its own connected genome view, place the protein
  // view side-by-side (left genome | right protein). Explicit override; falls
  // back to the launch-dialog localStorage preference.
  sideBySide?: boolean
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
        structures: _structures,
        url: _url,
        data: _data,
        pdbId: _pdbId,
        initialSelection: _initialSelection,
        initialResidues: _initialResidues,
        initialTranscriptResidues: _initialTranscriptResidues,
        mappedEntityId: _mappedEntityId,
        pairwiseAlignment: _pairwiseAlignment,
        alignmentImported: _alignmentImported,
        hidden: _hidden,
        uniprotId,
        transcriptId,
        userProvidedTranscriptSequence,
        feature,
        connectedViewId,
        connectedView: givenConnectedView,
        gene,
        sideBySide,
        ...settings
      } = args
      const fail = (e: unknown) => {
        console.error(e)
        session.notify(`Could not launch protein view: ${e}`, 'error')
        return args
      }

      const { session: _session, ...launch } = args
      const normalized = normalizeLaunch(launch)
      for (const warning of normalized.warnings) {
        console.warn(warning)
        session.notify(`Protein view launch: ${warning}`, 'warning')
      }
      if ('error' in normalized) {
        return fail(normalized.error)
      }
      const { geneModel } = normalized

      // A gene name alone: the host's text search finds the gene, and the
      // launch dialog's defaults pick its isoform and AlphaFold model. A
      // structure, transcript or locus the spec names wins over those.
      let named: Awaited<ReturnType<typeof resolveGeneNameLaunch>> | undefined
      if (gene && !userProvidedTranscriptSequence) {
        try {
          named = await resolveGeneNameLaunch({
            session,
            gene,
            transcriptId,
            uniprotId,
            findStructure: geneModel === 'required',
            connectedView: givenConnectedView,
            connectedViewId,
          })
        } catch (e) {
          return fail(e)
        }
      }
      const connectedView = connectedViewId
        ? givenConnectedView
        : (named?.connectedView ?? givenConnectedView)
      if (gene && named && geneModel === 'required' && !named.url) {
        return fail(
          new Error(
            `${describeMissingStructure(gene, named)}; name a ${named.uniprotId ? 'pdbId or url' : 'uniprotId or pdbId'}`,
          ),
        )
      }
      const requested =
        named && geneModel
          ? normalized.requested.map(s => ({ ...s, url: named.url }))
          : normalized.requested

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

      const structures = requested.map(s => ({
        ...s,
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
