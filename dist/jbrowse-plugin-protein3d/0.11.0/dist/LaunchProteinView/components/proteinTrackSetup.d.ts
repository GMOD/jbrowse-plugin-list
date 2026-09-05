import type { SessionWithAddTracks } from '@jbrowse/core/util';
/**
 * Adds all protein annotation tracks for a given UniProt ID
 */
export declare function addAllProteinTracks({ session, uniprotId, confidenceUrl, }: {
    session: SessionWithAddTracks;
    uniprotId: string;
    confidenceUrl: string | undefined;
}): Promise<void>;
