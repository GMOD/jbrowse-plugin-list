/**
 * Convert Foldseek tCa coordinates and tSeq to PDB format
 * tCa is a comma-separated string of x,y,z triplets
 * tSeq is the amino acid sequence
 */
export declare function caCoordsToPdb(tCa: string, tSeq: string, chainId?: string, title?: string): string;
/**
 * Check if a hit has valid tCa data that can be converted to PDB
 */
export declare function hasValidCaCoords(tCa?: string, tSeq?: string): boolean;
