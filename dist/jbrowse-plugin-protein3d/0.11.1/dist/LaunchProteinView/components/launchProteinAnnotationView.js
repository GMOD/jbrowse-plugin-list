import { setupProteinAssembly } from './proteinAssemblySetup';
import { addAllProteinTracks } from './proteinTrackSetup';
import { formatViewName } from '../utils/launchViewUtils';
export async function launchProteinAnnotationView({ session, feature, selectedTranscript, uniprotId, confidenceUrl, connectedViewId, }) {
    setupProteinAssembly(session, uniprotId);
    await addAllProteinTracks({
        session,
        uniprotId,
        confidenceUrl,
    });
    // The linkage drives the 1D<->genome hover highlight. It is a property of
    // the view (see Protein1DLinkage) so it is saved with the session.
    const proteinLinkage = connectedViewId && selectedTranscript
        ? { connectedViewId, feature: selectedTranscript.toJSON(), uniprotId }
        : undefined;
    const view = session.addView('LinearGenomeView', {
        type: 'LinearGenomeView',
        displayName: formatViewName('Protein annotations', feature, selectedTranscript, uniprotId),
        proteinLinkage,
    });
    await view.navToLocString(uniprotId, uniprotId);
}
