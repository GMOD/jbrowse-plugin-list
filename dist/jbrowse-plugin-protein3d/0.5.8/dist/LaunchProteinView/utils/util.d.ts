import type { Feature } from '@jbrowse/core/util';
export declare function stripStopCodon(seq: string): string;
export declare function getTranscriptFeatures(feature: Feature): Feature[];
export declare function stripTrailingVersion(s?: string): string | undefined;
export declare function getId(val?: Feature): string;
export declare function getTranscriptDisplayName(val?: Feature): string;
export declare function getGeneDisplayName(val?: Feature): string;
export declare function getUniProtIdFromFeature(f?: Feature): string | undefined;
export declare function isRecognizedDatabaseId(id: string): boolean;
export declare function getDbIdLabel(id: string): string;
export declare function buildUniProtXrefQuery(id: string): string | undefined;
export declare function findRecognizedDbIds(f?: Feature): string[];
export interface FeatureIdentifiers {
    recognizedIds: string[];
    uniprotId?: string;
    geneId?: string;
    geneName?: string;
}
/**
 * Extract all useful identifiers from a feature for UniProt lookup.
 * If the feature is a gene, prioritizes identifiers from its first transcript.
 * Otherwise, extracts identifiers from the feature itself.
 * geneId and geneName are always extracted from the parent feature 'f'.
 */
export declare function extractFeatureIdentifiers(f?: Feature): FeatureIdentifiers;
export interface IsoformSequence {
    feature: Feature;
    seq: string;
}
export type IsoformSequences = Record<string, IsoformSequence>;
export interface RankedIsoform {
    feature: Feature;
    length: number;
}
export interface ClassifiedIsoforms {
    matches: RankedIsoform[];
    nonMatches: RankedIsoform[];
    noData: Feature[];
}
export declare function classifyIsoforms({ options, isoformSequences, structureSequence, }: {
    options: Feature[];
    isoformSequences: IsoformSequences;
    structureSequence?: string;
}): ClassifiedIsoforms;
export declare function selectBestTranscript(args: {
    options: Feature[];
    isoformSequences: IsoformSequences;
    structureSequence?: string;
}): Feature | undefined;
