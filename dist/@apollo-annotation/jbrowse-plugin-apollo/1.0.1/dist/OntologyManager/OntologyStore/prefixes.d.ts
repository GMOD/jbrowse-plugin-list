/**
 * This file contains stuff dealing with IRI prefixes used in ontologies.
 *
 * ```
 * const prefixes = new Map(['GO:', 'http://long.url/GO_'])
 *
 * applyPrefixes('http://long.url/GO_1234345') // returns 'GO:1234345'
 *
 * expandPrefixes('GO:1234345') // returns 'http://long.url/GO_1234345'
 * ```
 */
/**
 * compact the given URI using the given prefixes
 */
export declare function applyPrefixes(uri: string, prefixes: Map<string | number, string>): string;
/**
 * expand the given compacted URI using given prefixes
 */
export declare function expandPrefixes(uri: string, prefixes: Map<string | number, string>): string;
//# sourceMappingURL=prefixes.d.ts.map