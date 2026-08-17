/**
 * Convert Foldseek tCa coordinates and tSeq to PDB format
 * tCa is a comma-separated string of x,y,z triplets
 * tSeq is the amino acid sequence
 */
export declare function caCoordsToPdb(tCa: string, tSeq: string, chainId?: string, title?: string): string;
/**
 * Whether a Foldseek hit carries tCa data that can be converted to PDB. A type
 * predicate rather than a boolean so a guarded caller can pass `hit.tCa`/
 * `hit.tSeq` straight to caCoordsToPdb without re-asserting they're defined.
 */
export declare function hasValidCaCoords<T extends {
    tCa?: string;
    tSeq?: string;
}>(hit: T): hit is T & {
    tCa: string;
    tSeq: string;
};
