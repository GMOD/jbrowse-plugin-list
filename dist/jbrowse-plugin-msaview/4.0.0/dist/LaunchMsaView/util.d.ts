import type { AbstractTrackModel, Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
export declare function getLinearGenomeView(model: AbstractTrackModel): LinearGenomeViewModel;
export declare function getTranscriptFeatures(feature: Feature): Feature[];
export declare function getTranscriptLength(feature: Feature): {
    len: number;
    mod: number;
};
export declare function getId(val?: Feature): string;
export declare function featureMatchesId(feature: Feature, id: string): boolean;
export declare function getTranscriptDisplayName(val?: Feature): string;
export declare function getGeneDisplayName(val?: Feature): string;
export declare function getBlastViewTitle(feature: Feature, transcript: Feature): string;
export declare function getSortedTranscriptFeatures(feature: Feature): Feature[];
/**
 * A translation as a query, still one residue per codon: g2p numbers codons,
 * and the query row is read through it. So the partial first codon (`&`), an
 * internal stop and an unreadable codon become X, and only what trails the
 * last whole codon is dropped.
 */
export declare function cleanProteinSequence(seq: string): string;
export declare function getGeneIdentifiers(feature: Feature): string[];
