import { SimpleFeature } from '@jbrowse/core/util'
import { fetchAlphaFoldModels } from 'p2s_mapper'

import { normalizeAnnotationLaunch } from './normalizeAnnotationLaunch'
import {
  connectGenomeView,
  resolveTranscriptLinkage,
} from './transcriptLinkage'
import { clinVarTrackConfFor } from '../LaunchProteinView/components/clinVarTrackSource'
import { openProteinAnnotationView } from '../LaunchProteinView/components/launchProteinAnnotationView'
import { canAddTemporaryAssembly } from '../LaunchProteinView/components/proteinAssemblySetup'
import { fetchUniProtFeatureTypes } from '../LaunchProteinView/components/proteinTrackSetup'
import { describeMissingStructure } from '../LaunchProteinView/resolveGeneLaunch'
import { uniProtEntry } from '../LaunchProteinView/utils/launchViewUtils'
import { viewAssemblyName } from '../ProteinView/util'

import type { AbstractSessionModel } from '@jbrowse/core/util'

// The canonical model's pLDDT is in the entry's numbering; an isoform model's
// is not, and has no place on the entry's track
async function entryConfidenceUrl(uniprotId: string) {
  try {
    const models = await fetchAlphaFoldModels(uniprotId)
    return models.find(m => m.accession === uniprotId)?.confidenceUrl
  } catch {
    return undefined
  }
}

export interface AnnotationLaunchArgs {
  session: AbstractSessionModel
}

export async function launchAnnotationView(args: AnnotationLaunchArgs) {
  const { session, ...given } = args
  const fail = (e: unknown) => {
    console.error(e)
    session.notify(`Could not launch protein annotation view: ${e}`, 'error')
    return args
  }
  const normalized = normalizeAnnotationLaunch(given)
  for (const warning of normalized.warnings) {
    console.warn(warning)
    session.notify(`Protein annotation view launch: ${warning}`, 'warning')
  }
  if ('error' in normalized) {
    return fail(normalized.error)
  }
  if (!canAddTemporaryAssembly(session)) {
    return fail(
      'this session cannot add the temporary assembly the view opens on',
    )
  }
  const { launch } = normalized
  try {
    const { named, resolved, connectedView } = await resolveTranscriptLinkage(
      session,
      launch,
      {
        findStructure: !launch.uniprotId,
      },
    )
    const accession = launch.uniprotId ?? named?.uniprotId
    if (!accession) {
      throw new Error(
        launch.gene && named
          ? `${describeMissingStructure(launch.gene, named)}; name a uniprotId`
          : 'no UniProt entry to open',
      )
    }
    const uniprotId = uniProtEntry(accession)
    // fetched before anything is added, so a failure leaves no view
    const [featureTypes, confidenceUrl] = await Promise.all([
      fetchUniProtFeatureTypes(uniprotId),
      entryConfidenceUrl(uniprotId),
    ])
    const transcript = resolved
      ? new SimpleFeature(resolved.feature)
      : undefined
    const connectedViewId = transcript
      ? connectGenomeView(session, launch.connectedViewId, connectedView)
      : undefined
    await openProteinAnnotationView({
      session,
      feature: transcript,
      selectedTranscript: transcript,
      uniprotId,
      confidenceUrl,
      connectedViewId,
      connectedAssemblyName:
        (launch.connectedViewId
          ? viewAssemblyName(session, launch.connectedViewId)
          : undefined) ?? connectedView?.assembly,
      featureTypes,
      clinVar: (linkage, idPrefix) =>
        clinVarTrackConfFor({ session, linkage, idPrefix }),
    })
  } catch (e) {
    return fail(e)
  }
  return args
}
