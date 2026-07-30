import { isSessionWithAddTracks } from '@jbrowse/core/util'

import { maybeLaunchSideBySide } from './sideBySide'
import {
  ALPHAFOLD_VERSION,
  getAlphaFoldConfidenceUrl,
  getAlphaFoldMsaUrl,
  getAlphaFoldStructureUrl,
  getConfidenceUrlFromTarget,
  getPdbStructureUrl,
  getStructureUrlFromTarget,
  getUniprotIdFromAlphaFoldTarget,
} from './structureUrls'
import { getGeneDisplayName, getTranscriptDisplayName } from './util'
import { proteinViewSnapshot } from '../../ProteinView/proteinViewSpec'
import { launchProteinAnnotationView } from '../components/launchProteinAnnotationView'

// Re-exported so existing importers keep their `launchViewUtils` import path.
export {
  ALPHAFOLD_VERSION,
  getAlphaFoldConfidenceUrl,
  getAlphaFoldMsaUrl,
  getAlphaFoldStructureUrl,
  getConfidenceUrlFromTarget,
  getPdbStructureUrl,
  getStructureUrlFromTarget,
  getUniprotIdFromAlphaFoldTarget,
}

import type {
  AbstractSessionModel,
  Feature,
  SessionWithAddTracks,
} from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

declare global {
  interface Window {
    JBrowsePluginMsaView?: unknown
  }
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
  const snap = proteinViewSnapshot({
    alignmentAlgorithm,
    connectedMsaViewId,
    displayName:
      displayName ??
      formatViewName('Protein view', feature, selectedTranscript, uniprotId),
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

// The 1D-annotation and MSA launches share identical availability rules across
// the AlphaFold and Foldseek launch menus: the 1D view needs an add-tracks
// session and a uniprotId, the MSA view needs the msaview plugin and a
// uniprotId. Returning each as a ready-to-run thunk (or undefined when
// unavailable) is the single source of truth — an unavailable action is
// unrepresentable rather than a menu item that silently no-ops.
export function getConditionalProteinLaunches({
  session,
  view,
  feature,
  selectedTranscript,
  uniprotId,
  confidenceUrl,
}: LaunchViewParams & { confidenceUrl?: string }) {
  const addTracksSession = isSessionWithAddTracks(session) ? session : undefined
  return {
    launch1D:
      addTracksSession && uniprotId
        ? () =>
            launch1DProteinView({
              session: addTracksSession,
              view,
              feature,
              selectedTranscript,
              uniprotId,
              confidenceUrl,
            })
        : undefined,
    launchMsa:
      uniprotId && hasMsaViewPlugin()
        ? () =>
            launchMsaView({
              session,
              view,
              feature,
              selectedTranscript,
              uniprotId,
            })
        : undefined,
  }
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
