import { setupProteinAssembly } from './proteinAssemblySetup';
import { addAllProteinTracks } from './proteinTrackSetup';
import { protein1DViewRegistry } from '../../Protein1DViewRegistry';
import { formatViewName } from '../utils/launchViewUtils';
export async function launchProteinAnnotationView({ session, feature, selectedTranscript, uniprotId, confidenceUrl, connectedViewId, }) {
    setupProteinAssembly(session, uniprotId);
    await addAllProteinTracks({
        session,
        uniprotId,
        confidenceUrl,
    });
    const view = session.addView('LinearGenomeView', {
        type: 'LinearGenomeView',
        displayName: formatViewName('Protein view', feature, selectedTranscript, uniprotId),
    });
    // Register for linked highlighting between 1D and 3D views
    if (connectedViewId && selectedTranscript) {
        protein1DViewRegistry.register({
            viewId: view.id,
            connectedViewId,
            feature: selectedTranscript.toJSON(),
            uniprotId,
        });
    }
    await view.navToLocString(uniprotId, uniprotId);
}
