import type { Sample } from '../types';
import type { Feature, Region } from '@jbrowse/core/util';
/**
 * Process features into FASTA format
 * @param features - The features to process
 * @param selectedRegion - Optional region to extract
 * @returns FASTA formatted text
 */
export declare function processFeaturesToFasta({ regions, showAllLetters, samples, features, includeInsertions, }: {
    regions: Region[];
    samples: Sample[];
    showAsUpperCase?: boolean;
    mismatchRendering?: boolean;
    showAllLetters?: boolean;
    includeInsertions?: boolean;
    features: Map<string, Feature>;
}): string[];
