declare global {
  interface Window {
    JBrowsePluginMsaView?: unknown
  }
}

import { maybeLaunchSideBySide } from './sideBySide'
import { getGeneDisplayName, getTranscriptDisplayName } from './util'
import { launchProteinAnnotationView } from '../components/launchProteinAnnotationView'

import type {
  AbstractSessionModel,
  Feature,
  SessionWithAddTracks,
} from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

export const ALPHAFOLD_VERSION = 'v6'

export function getAlphaFoldStructureUrl(
  uniprotId: string,
  version = ALPHAFOLD_VERSION,
) {
  return `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-model_${version}.cif`
}

export function getAlphaFoldConfidenceUrl(
  uniprotId: string,
  version = ALPHAFOLD_VERSION,
) {
  return `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-confidence_${version}.json`
}

export function getAlphaFoldMsaUrl(
  uniprotId: string,
  version = ALPHAFOLD_VERSION,
) {
  return `https://alphafold.ebi.ac.uk/files/msa/AF-${uniprotId}-F1-msa_${version}.a3m`
}

export function getPdbStructureUrl(pdbId: string) {
  return `https://files.rcsb.org/download/${pdbId}.cif`
}

// Foldseek targets may contain a description after the ID separated by a
// space, e.g. "AF-P16442-F1-model_v6 Histo-blood group ABO transferase".
function extractTargetId(target: string) {
  return target.split(' ')[0]!
}

export function getUniprotIdFromAlphaFoldTarget(target: string) {
  // Handles both "AF-P16442-F1-model_v6" and full URLs like
  // "https://alphafold.ebi.ac.uk/files/AF-P16442-F1-model_v6.cif"
  const match = /AF-([A-Z0-9]+)-F\d+/.exec(extractTargetId(target))
  return match?.[1]
}

export function getStructureUrlFromTarget(target: string, db: string) {
  const targetId = extractTargetId(target)
  if (targetId.startsWith('AF-')) {
    return `https://alphafold.ebi.ac.uk/files/${targetId}.cif`
  }
  if (db === 'pdb100') {
    const pdbId = targetId.split('_')[0]!
    if (pdbId.length === 4) {
      return getPdbStructureUrl(pdbId)
    }
  }
  return undefined
}

export function getConfidenceUrlFromTarget(target: string) {
  const targetId = extractTargetId(target)
  if (targetId.startsWith('AF-')) {
    const confidenceId = targetId.replace('-model_', '-confidence_')
    return `https://alphafold.ebi.ac.uk/files/${confidenceId}.json`
  }
  return undefined
}

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
  alignmentAlgorithm?: string
  displayName?: string
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
  alignmentAlgorithm,
  displayName,
  connectedMsaViewId,
  sideBySide,
}: LaunchViewParams &
  Launch3DExtraParams & {
    connectedMsaViewId?: string
    // explicit override; when undefined the launch-dialog localStorage
    // preference decides (left genome | right protein)
    sideBySide?: boolean
  }) {
  const snap = {
    type: 'ProteinView',
    alignmentAlgorithm,
    connectedMsaViewId,
    structures: [
      {
        url,
        data,
        userProvidedTranscriptSequence: userProvidedTranscriptSequence ?? '',
        feature: selectedTranscript?.toJSON(),
        connectedViewId: view.id,
      },
    ],
    displayName:
      displayName ??
      formatViewName('Protein view', feature, selectedTranscript, uniprotId),
  }
  const proteinView = session.addView('ProteinView', snap)
  maybeLaunchSideBySide(session, proteinView.id, sideBySide)
  return proteinView
}

// The 1D annotation view adds temporary tracks/assemblies, so it requires a
// SessionWithAddTracks and a known uniprotId. Demanding both in the signature
// forces callers to narrow up front — there's no silent no-op when a wide
// session or missing id slips through.
export async function launch1DProteinView({
  session,
  view,
  feature,
  selectedTranscript,
  uniprotId,
  confidenceUrl,
}: Omit<LaunchViewParams, 'session' | 'uniprotId'> & {
  session: SessionWithAddTracks
  uniprotId: string
  confidenceUrl?: string
}) {
  await launchProteinAnnotationView({
    session,
    selectedTranscript,
    feature,
    uniprotId,
    confidenceUrl,
    connectedViewId: view.id,
  })
}

// CROSS-REPO DEPENDENCY: the 'MsaView' view type is registered by
// jbrowse-plugin-msaview, which wraps the `react-msaview` library. The top-level
// props here (colorSchemeName, connectedViewId, connectedFeature) are native
// react-msaview model properties applied directly from the snapshot; only `init`
// (msaUrl) is a declarative launch contract that the plugin resolves once and
// clears. These are NOT type-checked here because we only depend on it at runtime
// (gated by hasMsaViewPlugin()). If react-msaview renames these, the launch
// silently degrades. Keep in step with that repo.
export function launchMsaView({
  session,
  view,
  feature,
  selectedTranscript,
  uniprotId,
  displayName,
}: LaunchViewParams & { displayName?: string }) {
  if (!uniprotId) {
    return undefined
  }
  return session.addView('MsaView', {
    type: 'MsaView',
    displayName:
      displayName ??
      formatViewName('MSA view', feature, selectedTranscript, uniprotId),
    connectedViewId: view.id,
    connectedFeature: selectedTranscript?.toJSON(),
    colorSchemeName: 'percent_identity',
    init: {
      msaUrl: getAlphaFoldMsaUrl(uniprotId),
    },
  })
}

export function hasMsaViewPlugin() {
  return window.JBrowsePluginMsaView !== undefined
}

export function launch3DProteinViewWithMsa(
  params: LaunchViewParams & Launch3DExtraParams,
) {
  const { uniprotId } = params
  if (!uniprotId) {
    return undefined
  }
  const msaView = launchMsaView(params)
  return launch3DProteinView({
    ...params,
    connectedMsaViewId: msaView?.id,
  })
}
