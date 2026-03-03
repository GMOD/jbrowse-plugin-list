import { SessionWithAddTracks } from '@jbrowse/core/util';
/**
 * Fetches UniProt GFF data and extracts unique feature types
 */
export declare function fetchUniProtFeatureTypes(uniprotId: string): Promise<string[]>;
/**
 * Adds UniProt feature tracks for each feature type
 */
export declare function addUniProtFeatureTracks({ session, uniprotId, featureTypes, }: {
    session: SessionWithAddTracks;
    uniprotId: string;
    featureTypes: string[];
}): void;
/**
 * Adds antigen annotation track from EBI
 */
export declare function addAntigenTrack({ session, uniprotId, }: {
    session: SessionWithAddTracks;
    uniprotId: string;
}): void;
/**
 * Adds variation track from EBI
 */
export declare function addVariationTrack({ session, uniprotId, }: {
    session: SessionWithAddTracks;
    uniprotId: string;
}): void;
/**
 * Adds AlphaFold confidence track
 */
export declare function addAlphaFoldConfidenceTrack({ session, uniprotId, confidenceUrl, }: {
    session: SessionWithAddTracks;
    uniprotId: string;
    confidenceUrl: string | undefined;
}): void;
/**
 * Adds AlphaMissense pathogenicity scores track
 */
export declare function addAlphaMissenseTrack({ session, uniprotId, }: {
    session: SessionWithAddTracks;
    uniprotId: string;
}): void;
/**
 * Adds all protein annotation tracks for a given UniProt ID
 */
export declare function addAllProteinTracks({ session, uniprotId, confidenceUrl, }: {
    session: SessionWithAddTracks;
    uniprotId: string;
    confidenceUrl: string | undefined;
}): Promise<void>;
