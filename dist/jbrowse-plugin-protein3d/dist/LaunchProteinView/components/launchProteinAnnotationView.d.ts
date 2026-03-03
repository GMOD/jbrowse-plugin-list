import { Feature, SessionWithAddTracks } from '@jbrowse/core/util';
/**
 * Launches a protein annotation view for a UniProt entry
 * Creates assembly, adds annotation tracks, and navigates to the protein view
 */
export declare function launchProteinAnnotationView({ session, feature, selectedTranscript, uniprotId, confidenceUrl, connectedViewId, }: {
    session: SessionWithAddTracks;
    feature: Feature;
    selectedTranscript?: Feature;
    uniprotId: string;
    confidenceUrl?: string;
    connectedViewId?: string;
}): Promise<void>;
