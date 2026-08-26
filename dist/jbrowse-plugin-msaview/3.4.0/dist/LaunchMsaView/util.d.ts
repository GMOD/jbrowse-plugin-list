import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
export declare function getLinearGenomeView(model: AbstractTrackModel): LinearGenomeViewModel;
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
export declare function getBlastViewTitle(feature: Feature, transcript: Feature): string;
export declare function getSortedTranscriptFeatures(feature: Feature): Feature[];
export declare function cleanProteinSequence(seq: string): string;
export declare function getGeneIdentifiers(feature: Feature): string[];
