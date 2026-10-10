import { setupProteinAssembly } from './proteinAssemblySetup'
import {
  fetchUniProtFeatureTypes,
  proteinTrackConfs,
} from './proteinTrackSetup'
import { formatViewName } from '../utils/launchViewUtils'

import type { TemporaryAssemblySession } from './proteinAssemblySetup'
import type { Protein1DLinkage } from '../../Protein1DLinkage'
import type { Feature } from '@jbrowse/core/util'

interface TrackLaunchingView {
  id: string
  launchTrack: (
    trackId: string,
    initialSnapshot: object,
    displayInitialSnapshot: object,
    inlineConf: Record<string, unknown>,
  ) => Promise<unknown>
  navToLocString: (loc: string, assemblyName: string) => Promise<unknown>
}

// No `addSessionTrackConf`: the host rejects a session track naming a
// temporary assembly, so the type keeps the tracks on the view
export interface ProteinAnnotationSession extends TemporaryAssemblySession {
  addView: (
    typeName: 'LinearGenomeView',
    snapshot: {
      type: 'LinearGenomeView'
      displayName: string
      proteinLinkage: Protein1DLinkage | undefined
    },
  ) => object
  notifyError: (message: string, error?: unknown) => void
  assemblyManager: { get: (name: string) => unknown }
}

function isTrackLaunchingView(view: object): view is TrackLaunchingView {
  return (
    'id' in view &&
    typeof view.id === 'string' &&
    'launchTrack' in view &&
    typeof view.launchTrack === 'function' &&
    'navToLocString' in view &&
    typeof view.navToLocString === 'function'
  )
}

export async function launchProteinAnnotationView({
  session,
  feature,
  selectedTranscript,
  uniprotId,
  confidenceUrl,
  connectedViewId,
  connectedAssemblyName,
}: {
  session: ProteinAnnotationSession
  feature: Feature
  selectedTranscript?: Feature
  uniprotId: string
  confidenceUrl?: string
  connectedViewId?: string
  connectedAssemblyName?: string
}) {
  // Fetched before anything is added: a failed download would otherwise
  // leave a temporary assembly behind with no view on it
  const featureTypes = await fetchUniProtFeatureTypes(uniprotId)

  // A second view of an entry, another isoform's say, shares the first's
  // assembly; adding it again makes the host warn
  if (!session.assemblyManager.get(uniprotId)) {
    setupProteinAssembly(session, uniprotId)
  }

  // The linkage drives the 1D<->genome hover highlight. It is a property of
  // the view (see Protein1DLinkage) so it is saved with the session.
  const proteinLinkage: Protein1DLinkage | undefined =
    connectedViewId && selectedTranscript
      ? {
          connectedViewId,
          assemblyName: connectedAssemblyName,
          feature: selectedTranscript.toJSON(),
          uniprotId,
        }
      : undefined

  const view = session.addView('LinearGenomeView', {
    type: 'LinearGenomeView',
    displayName: formatViewName(
      'Protein annotations',
      feature,
      selectedTranscript,
      uniprotId,
    ),
    proteinLinkage,
  })
  if (!isTrackLaunchingView(view)) {
    throw new Error('The host added a view that cannot open tracks')
  }

  // Each config rides on its track in this view, not in the session's track
  // list: the host rejects a session track naming a temporary assembly, and
  // the track selector lists session tracks only, so every track opens here
  // or is unreachable
  for (const conf of proteinTrackConfs({
    uniprotId,
    featureTypes,
    confidenceUrl,
    idPrefix: `${view.id}-${uniprotId}`,
  })) {
    try {
      // the host reports a config it rejects itself and resolves undefined
      await view.launchTrack(conf.trackId, {}, {}, conf)
    } catch (e) {
      session.notifyError(`Could not open the ${conf.name} track: ${e}`, e)
    }
  }

  await view.navToLocString(uniprotId, uniprotId)
}
