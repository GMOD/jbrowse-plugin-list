import { setupProteinAssembly } from './proteinAssemblySetup'
import { addAllProteinTracks } from './proteinTrackSetup'
import { protein1DViewRegistry } from '../../Protein1DViewRegistry'
import { formatViewName } from '../utils/launchViewUtils'

import type { Feature, SessionWithAddTracks } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

export async function launchProteinAnnotationView({
  session,
  feature,
  selectedTranscript,
  uniprotId,
  confidenceUrl,
  connectedViewId,
}: {
  session: SessionWithAddTracks
  feature: Feature
  selectedTranscript?: Feature
  uniprotId: string
  confidenceUrl?: string
  connectedViewId?: string
}) {
  setupProteinAssembly(session, uniprotId)

  await addAllProteinTracks({
    session,
    uniprotId,
    confidenceUrl,
  })

  const view = session.addView('LinearGenomeView', {
    type: 'LinearGenomeView',
    displayName: formatViewName(
      'Protein annotations',
      feature,
      selectedTranscript,
      uniprotId,
    ),
  }) as LinearGenomeViewModel

  // Register for linked highlighting between 1D and 3D views
  if (connectedViewId && selectedTranscript) {
    protein1DViewRegistry.register({
      viewId: view.id,
      connectedViewId,
      feature: selectedTranscript.toJSON(),
      uniprotId,
    })
  }

  await view.navToLocString(uniprotId, uniprotId)
}
