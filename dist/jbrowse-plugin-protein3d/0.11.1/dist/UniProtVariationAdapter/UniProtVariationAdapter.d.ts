import { BaseProteinAnnotationAdapter } from '../BaseProteinAnnotationAdapter';
interface UniProtVariantFeature {
    begin: string;
    end: string;
    wildType: string;
    mutatedType: string;
    xrefs: {
        name: string;
        id: string;
        url: string;
        alternativeUrl: string;
    }[];
    predictions?: {
        score: number;
    }[];
    descriptions?: {
        value: string;
    }[];
    populationFrequencies?: {
        frequency?: number;
    }[];
}
/**
 * Converts UniProt variant features to plugin features. begin/end are 1-based
 * inclusive, converted here to a 0-based half-open interval [begin-1, end) so
 * variants line up with the interbase protein reference sequence.
 */
export declare function parseUniProtVariants(features: UniProtVariantFeature[], scoreField: string): {
    uniqueId: string;
    start: number;
    end: number;
    score: number | undefined;
    description: string | undefined;
    name: string[];
    wildType: string;
    mutatedType: string;
    xrefs: {
        name: string;
        id: string;
        url: string;
        alternativeUrl: string;
    }[];
    predictions?: {
        score: number;
    }[];
    descriptions?: {
        value: string;
    }[];
    populationFrequencies?: {
        frequency?: number;
    }[];
}[];
type UniProtVariantRow = ReturnType<typeof parseUniProtVariants>[number];
export default class UniProtVariationAdapter extends BaseProteinAnnotationAdapter<UniProtVariantRow> {
    protected loadFeatures(): Promise<{
        uniqueId: string;
        start: number;
        end: number;
        score: number | undefined;
        description: string | undefined;
        name: string[];
        wildType: string;
        mutatedType: string;
        xrefs: {
            name: string;
            id: string;
            url: string;
            alternativeUrl: string;
        }[];
        predictions?: {
            score: number;
        }[];
        descriptions?: {
            value: string;
        }[];
        populationFrequencies?: {
            frequency?: number;
        }[];
    }[]>;
}
export {};
