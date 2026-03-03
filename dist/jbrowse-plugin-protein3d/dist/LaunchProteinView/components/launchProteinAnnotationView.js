import { setupProteinAssembly } from './proteinAssemblySetup';
import { addAllProteinTracks } from './proteinTrackSetup';
import { protein1DViewRegistry } from '../../Protein1DViewRegistry';
import { getGeneDisplayName, getTranscriptDisplayName } from '../utils/util';
/**
 * Launches a protein annotation view for a UniProt entry
 * Creates assembly, adds annotation tracks, and navigates to the protein view
 */
export async function launchProteinAnnotationView({ session, feature, selectedTranscript, uniprotId, confidenceUrl, connectedViewId, }) {
    // Set up the protein assembly
    setupProteinAssembly(session, uniprotId);
    // Add all annotation tracks
    await addAllProteinTracks({
        session,
        uniprotId,
        confidenceUrl,
    });
    // Create and navigate to the view
    const view = session.addView('LinearGenomeView', {
        type: 'LinearGenomeView',
        displayName: [
            'Protein view',
            uniprotId,
            getGeneDisplayName(feature),
            getTranscriptDisplayName(selectedTranscript),
        ].join(' - '),
    });
    // Register the 1D view for linked highlighting
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
//# sourceMappingURL=launchProteinAnnotationView.js.map