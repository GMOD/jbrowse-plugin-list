import { isSessionWithAddTracks } from '@jbrowse/core/util'

declare global {
  interface Window {
    JBrowsePluginMsaView?: unknown
  }
}

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

export function getUniprotIdFromAlphaFoldTarget(target: string) {
  // Extract UniProt ID from AlphaFold target or URL
  // Handles both "AF-P16442-F1-model_v6" and full URLs like
  // "https://alphafold.ebi.ac.uk/files/AF-P16442-F1-model_v6.cif"
  const targetId = target.split(' ')[0] ?? target
  const match = /AF-([A-Z0-9]+)-F\d+/.exec(targetId)
  return match?.[1]
}

export function getStructureUrlFromTarget(target: string, db: string) {
  // Target may contain description after the ID
  const targetId = target.split(' ')[0] ?? target

  if (targetId.startsWith('AF-')) {
    return `https://alphafold.ebi.ac.uk/files/${targetId}.cif`
  }
  if (db === 'pdb100') {
    const pdbId = targetId.split('_')[0]
    if (pdbId?.length === 4) {
      return getPdbStructureUrl(pdbId)
    }
  }
  return undefined
}

export function getConfidenceUrlFromTarget(target: string) {
  const targetId = target.split(' ')[0] ?? target
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
}: LaunchViewParams & {
  url?: string
  data?: string
  userProvidedTranscriptSequence?: string
  alignmentAlgorithm?: string
  displayName?: string
  connectedMsaViewId?: string
}) {
  return session.addView('ProteinView', {
    type: 'ProteinView',
    isFloating: true,
    alignmentAlgorithm,
    connectedMsaViewId,
    structures: [
      {
        url,
        data,
        userProvidedTranscriptSequence,
        feature: selectedTranscript?.toJSON(),
        connectedViewId: view.id,
      },
    ],
    displayName:
      displayName ??
      [
        ...new Set([
          'Protein view',
          uniprotId,
          getGeneDisplayName(feature),
          getTranscriptDisplayName(selectedTranscript),
        ]),
      ].join(' - '),
  })
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

export function launchMsaView({
  session,
  view,
  feature,
  selectedTranscript,
  uniprotId,
}: LaunchViewParams) {
  if (!uniprotId) {
    return undefined
  }
  const msaUrl = getAlphaFoldMsaUrl(uniprotId)
  return session.addView('MsaView', {
    type: 'MsaView',
    displayName: [
      ...new Set([
        'MSA view',
        uniprotId,
        getGeneDisplayName(feature),
        getTranscriptDisplayName(selectedTranscript),
      ]),
    ].join(' - '),
    connectedViewId: view.id,
    connectedFeature: selectedTranscript?.toJSON(),
    init: {
      msaUrl,
      colorSchemeName: 'percent_identity',
    },
  })
}

export function hasMsaViewPlugin() {
  return typeof window.JBrowsePluginMsaView !== 'undefined'
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
  const { session, view, feature, selectedTranscript, uniprotId } = params
  if (!uniprotId) {
    return undefined
  }

  const msaUrl = getAlphaFoldMsaUrl(uniprotId)
  const baseName = [
    ...new Set([
      uniprotId,
      getGeneDisplayName(feature),
      getTranscriptDisplayName(selectedTranscript),
    ]),
  ].join(' - ')

  const msaView = session.addView('MsaView', {
    type: 'MsaView',
    displayName: `MSA view - ${baseName}`,
    connectedViewId: view.id,
    connectedFeature: selectedTranscript?.toJSON(),
    init: {
      msaUrl,
      colorSchemeName: 'percent_identity',
    },
  })

  return launch3DProteinView({
    ...params,
    displayName: params.displayName ?? `Protein view - ${baseName}`,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    connectedMsaViewId: msaView?.id,
  })
}
