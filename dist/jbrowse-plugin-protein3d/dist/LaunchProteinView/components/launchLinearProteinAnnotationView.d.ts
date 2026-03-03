import type { Feature, SessionWithAddTracks } from '@jbrowse/core/util';
export declare function launchLinearProteinAnnotationView({ session, uniprotId, feature, selectedTranscript, confidenceUrl, }: {
    session: SessionWithAddTracks;
    uniprotId: string;
    feature: Feature;
    selectedTranscript: Feature;
    confidenceUrl: string;
}): Promise<void>;
