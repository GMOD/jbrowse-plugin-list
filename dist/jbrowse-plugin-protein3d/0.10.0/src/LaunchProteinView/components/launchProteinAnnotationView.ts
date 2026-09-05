import { setupProteinAssembly } from './proteinAssemblySetup'
import { addAllProteinTracks } from './proteinTrackSetup'
import { formatViewName } from '../utils/launchViewUtils'

import type { Protein1DLinkage } from '../../Protein1DLinkage'
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

  // The linkage drives the 1D<->genome hover highlight. It is a property of
  // the view (see Protein1DLinkage) so it is saved with the session.
  const proteinLinkage: Protein1DLinkage | undefined =
    connectedViewId && selectedTranscript
      ? { connectedViewId, feature: selectedTranscript.toJSON(), uniprotId }
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
  }) as LinearGenomeViewModel

  await view.navToLocString(uniprotId, uniprotId)
}
