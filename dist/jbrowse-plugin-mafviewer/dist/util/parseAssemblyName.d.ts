export interface ParsedAssemblyName {
    assemblyName: string;
    chr: string;
}
/**
 * Parses assembly name and chromosome from a combined string in MAF tabix format.
 *
 * Handles multiple formats:
 * - Single string with no dots: assemblyName is the entire string, chr is empty
 * - `assembly.chr`: Single dot separates assembly name from chromosome
 * - `assembly.version.chr`: Two dots where middle part is numeric (version number)
 *   - assemblyName includes the version (e.g., "hg38.1" from "hg38.1.chr1")
 * - `assembly.chr.more`: Two dots where middle part is non-numeric
 *   - assemblyName is first part, chr includes rest (e.g., "mm10" and "chr1.random")
 */
export declare function parseAssemblyAndChr(assemblyAndChr: string): ParsedAssemblyName;
/**
 * Parses assembly name and chromosome from a combined string in BigMaf format.
 *
 * Uses simple dot splitting: org.chr where org is before the first dot,
 * chr is everything after the first dot.
 */
export declare function parseAssemblyAndChrSimple(organismChr: string): ParsedAssemblyName;
/**
 * Selects the appropriate sequence from alignments based on the lookup order:
 * 1. refAssemblyName config value (if provided)
 * 2. query.assemblyName (from the region being queried)
 * 3. firstAssemblyNameFound (fallback to first assembly in data)
 */
export declare function selectReferenceSequenceString(alignments: Record<string, {
    seq: string;
}>, refAssemblyName: string | undefined, queryAssemblyName: string | undefined, firstAssemblyNameFound: string | undefined): string | undefined;
