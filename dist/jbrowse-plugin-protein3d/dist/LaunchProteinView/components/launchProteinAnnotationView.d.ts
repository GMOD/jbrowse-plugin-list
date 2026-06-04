import type { Feature, SessionWithAddTracks } from '@jbrowse/core/util';
export declare function launchProteinAnnotationView({ session, feature, selectedTranscript, uniprotId, confidenceUrl, connectedViewId, }: {
    session: SessionWithAddTracks;
    feature: Feature;
    selectedTranscript?: Feature;
    uniprotId: string;
    confidenceUrl?: string;
    connectedViewId?: string;
}): Promise<void>;
