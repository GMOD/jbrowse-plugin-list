export declare const ALPHAFOLD_VERSION = "v6";
export declare function getAlphaFoldStructureUrl(uniprotId: string, version?: string): string;
export declare function getAlphaFoldConfidenceUrl(uniprotId: string, version?: string): string;
export declare function getAlphaFoldMsaUrl(uniprotId: string, version?: string): string;
export declare function getPdbStructureUrl(pdbId: string): string;
export declare function getUniprotIdFromAlphaFoldTarget(target: string): string | undefined;
export declare function getStructureUrlFromTarget(target: string, db: string): string | undefined;
export declare function getConfidenceUrlFromTarget(target: string): string | undefined;
