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
    // a named object, because proteinLinkage comes from this plugin's own
    // LinearGenomeView extension, which the launch snapshot type cannot see
    const snapshot = {
        type: 'LinearGenomeView',
        displayName: formatViewName('Protein annotations', feature, selectedTranscript, uniprotId),
        proteinLinkage,
    };
    const view = session.addView('LinearGenomeView', snapshot);
    await view.navToLocString(uniprotId, uniprotId);
}
