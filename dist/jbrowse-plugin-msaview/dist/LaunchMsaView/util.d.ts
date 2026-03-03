import type { Feature } from '@jbrowse/core/util';
export declare function getTranscriptFeatures(feature: Feature): Feature[];
export declare function getTranscriptLength(feature: Feature): {
    len: number;
    mod: number;
};
export declare function getId(val?: Feature): string;
export declare function getMatchableIds(val?: Feature): string[];
export declare function featureMatchesId(feature: Feature, id: string): boolean;
export declare function getTranscriptDisplayName(val?: Feature): string;
export declare function getGeneDisplayName(val?: Feature): string;
export declare function getSortedTranscriptFeatures(feature: Feature): Feature[];
export declare function cleanProteinSequence(seq: string): string;
