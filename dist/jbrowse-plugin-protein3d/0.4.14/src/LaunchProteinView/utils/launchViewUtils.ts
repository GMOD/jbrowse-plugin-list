import { isSessionWithAddTracks } from '@jbrowse/core/util'

declare global {
  interface Window {
    JBrowsePluginMsaView?: unknown
  }
}

import { getLaunchSideBySide, launchViewSideBySide } from './sideBySide'
import { getGeneDisplayName, getTranscriptDisplayName } from './util'
import { launchProteinAnnotationView } from '../components/launchProteinAnnotationView'

import type { AbstractSessionModel, Feature } from '@jbrowse/core/util'
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
}: LaunchViewParams & {
  url?: string
  data?: string
  userProvidedTranscriptSequence?: string
  alignmentAlgorithm?: string
  displayName?: string
  connectedMsaViewId?: string
  // explicit override; when undefined the launch-dialog localStorage preference
  // decides (left genome | right protein)
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
  if (sideBySide ?? getLaunchSideBySide()) {
    launchViewSideBySide(session, proteinView.id)
  }
  return proteinView
}

export async function launch1DProteinView({
  session,
  view,
  feature,
  selectedTranscript,
  uniprotId,
  confidenceUrl,
}: LaunchViewParams & {
  confidenceUrl?: string
}) {
  if (!uniprotId || !isSessionWithAddTracks(session)) {
    return
  }
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
// jbrowse-plugin-msaview, which wraps the `react-msaview` library. The `init`
// keys below (msaUrl, colorSchemeName) and the connected* props are a runtime
// contract with that plugin's model — they are NOT type-checked here because we
// only depend on it at runtime (gated by hasMsaViewPlugin()). If react-msaview
// renames these, the launch silently degrades. Keep in step with that repo.
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
    init: {
      msaUrl: getAlphaFoldMsaUrl(uniprotId),
      colorSchemeName: 'percent_identity',
    },
  })
}

export function hasMsaViewPlugin() {
  return window.JBrowsePluginMsaView !== undefined
}

export function launch3DProteinViewWithMsa(
  params: LaunchViewParams & {
    url?: string
    data?: string
    userProvidedTranscriptSequence?: string
    alignmentAlgorithm?: string
    displayName?: string
  },
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
