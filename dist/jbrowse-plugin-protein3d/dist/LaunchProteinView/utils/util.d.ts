import { Feature } from '@jbrowse/core/util';
export declare function stripStopCodon(seq: string): string;
export declare function getTranscriptFeatures(feature: Feature): Feature[];
export declare function stripTrailingVersion(s?: string): string | undefined;
export declare function z(n: number): string;
export declare function getDisplayName(f: Feature): string;
export declare function getId(val?: Feature): string;
export declare function getTranscriptDisplayName(val?: Feature): string;
export declare function getGeneDisplayName(val?: Feature): string;
export declare function getUniProtIdFromFeature(f?: Feature): string | undefined;
/**
 * Check if an ID is a recognized database identifier that UniProt can map
 */
export declare function isRecognizedDatabaseId(id: string): boolean;
/**
 * Get the database type for a recognized ID (used for UniProt xref queries)
 */
export declare function getDatabaseTypeForId(id: string): string | undefined;
export interface FeatureIdentifiers {
    recognizedIds: string[];
    uniprotId?: string;
    geneId?: string;
    geneName?: string;
}
/**
 * Extract all useful identifiers from a feature for UniProt lookup.
 * Prioritizes recognized database IDs (Ensembl, RefSeq, CCDS, HGNC) over gene symbols.
 */
export declare function extractFeatureIdentifiers(f?: Feature): FeatureIdentifiers;
export declare function selectBestTranscript({ options, isoformSequences, structureSequence, }: {
    options: Feature[];
    isoformSequences: Record<string, {
        feature: Feature;
        seq: string;
    }>;
    structureSequence: string | undefined;
}): Feature | undefined;
