import { maybeLaunchSideBySide } from './sideBySide'
import { getGeneDisplayName, getTranscriptDisplayName } from './util'
import { proteinViewSnapshot } from '../../ProteinView/proteinViewSpec'
import { launchProteinAnnotationView } from '../components/launchProteinAnnotationView'
import { canAddTemporaryAssembly } from '../components/proteinAssemblySetup'

import type { TemporaryAssemblySession } from '../components/proteinAssemblySetup'
import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

interface LaunchViewParams {
  session: AbstractSessionModel
  view: LinearGenomeViewModel
  feature: Feature
  selectedTranscript?: Feature
  uniprotId?: string
}

interface Launch3DExtraParams {
  url?: string
  data?: string
  userProvidedTranscriptSequence?: string
}

export function formatViewName(
  prefix: string,
  feature: Feature,
  selectedTranscript?: Feature,
  uniprotId?: string,
) {
  return [
    ...new Set([
      prefix,
      uniprotId,
      getGeneDisplayName(feature),
      getTranscriptDisplayName(selectedTranscript),
    ]),
  ]
    .filter(s => !!s)
    .join(' - ')
}

export function launch3DProteinView({
  session,
  view,
  feature,
  selectedTranscript,
  uniprotId,
  url,
  data,
  userProvidedTranscriptSequence,
  sideBySide,
}: Omit<LaunchViewParams, 'view'> &
  Launch3DExtraParams & {
    view: { id: string }
    // explicit override; when undefined the launch-dialog localStorage
    // preference decides (left genome | right protein)
    sideBySide?: boolean
  }) {
  const snap = proteinViewSnapshot({
    displayName: formatViewName(
      'Protein view',
      feature,
      selectedTranscript,
      uniprotId,
    ),
    structures: [
      {
        url,
        data,
        userProvidedTranscriptSequence,
        feature: selectedTranscript?.toJSON(),
        connectedViewId: view.id,
      },
    ],
  })
  const proteinView = session.addView('ProteinView', snap)
  maybeLaunchSideBySide(session, proteinView.id, sideBySide)
  return proteinView
}

// The 1D annotation view adds a temporary assembly, so it requires a session
// that takes one and a known uniprotId. Demanding both in the signature forces
// callers to narrow up front — there's no silent no-op when a wide session or
// missing id slips through.
async function launch1DProteinView({
  session,
  view,
  feature,
  selectedTranscript,
  uniprotId,
  confidenceUrl,
}: Omit<LaunchViewParams, 'session' | 'uniprotId'> & {
  session: AbstractSessionModel & TemporaryAssemblySession
  uniprotId: string
  confidenceUrl?: string
}) {
  // UniProt publishes features for the entry, not for `P04637-7`, whose GFF is
  // a header alone. The view aligns the transcript to the entry's sequence, so
  // an isoform's residues still land on their own codons; its pLDDT is in the
  // isoform's numbering and has no place on the entry.
  const entry = uniprotId.replace(/-\d+$/, '')
  await launchProteinAnnotationView({
    session,
    selectedTranscript,
    feature,
    uniprotId: entry,
    confidenceUrl: entry === uniprotId ? confidenceUrl : undefined,
    connectedViewId: view.id,
    connectedAssemblyName: view.assemblyNames[0],
  })
}

// What the launches below are CALLED, shared for the same reason their
// availability is: the AlphaFold and Foldseek menus offer the same actions, and
// had drifted to different names ("Launch 3D protein structure view" vs "Launch
// 3D protein view"). Two names for one action reads as two actions.
export const PROTEIN_LAUNCH_LABELS = {
  '3d': 'Launch 3D protein structure view',
  '1d': 'Launch 1D protein annotation view',
} as const

// The 1D-annotation launch has the same availability rule on both the AlphaFold
// and Foldseek launch menus: a session that takes a temporary assembly, and a
// uniprotId. The tracks ride on the view, so a session that refuses session
// tracks (`disableAddTracks`) still qualifies. Returning it as a ready-to-run
// thunk (or undefined when unavailable) is the single source of truth — an
// unavailable action is unrepresentable rather than a menu item that silently
// no-ops.
export function getConditionalProteinLaunches({
  session,
  view,
  feature,
  selectedTranscript,
  uniprotId,
  confidenceUrl,
}: LaunchViewParams & { confidenceUrl?: string }) {
  const assemblySession = canAddTemporaryAssembly(session) ? session : undefined
  return {
    launch1D:
      assemblySession && uniprotId
        ? () =>
            launch1DProteinView({
              session: assemblySession,
              view,
              feature,
              selectedTranscript,
              uniprotId,
              confidenceUrl,
            })
        : undefined,
  }
}
