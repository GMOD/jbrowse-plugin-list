import type { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory';
/** Trailing extension of a filename or URL, lowercased, ignoring any query or
 * fragment and any `.gz` wrapper (`…/pdb1tup.ent.gz` -> `ent`). */
export declare function structureFileExtension(nameOrUrl: string): string;
/**
 * Format for a filename or URL. Unknown extensions fall back to mmCIF, which is
 * what every URL this plugin generates itself serves (AlphaFold and RCSB both
 * hand out `.cif`).
 */
export declare function structureFormatFromName(nameOrUrl: string): BuiltInTrajectoryFormat;
/** Whether a URL points at a binary-encoded structure, which molstar must be
 * told to download as bytes rather than text. */
export declare function isBinaryStructureUrl(url: string): boolean;
/**
 * Format for structure text that arrived without a filename — an inline `data`
 * snapshot, a pasted file, or the PDB the plugin synthesizes from Foldseek Cα
 * coordinates. Sniffs the content, which is strictly more reliable than a name
 * and is the only signal available here.
 *
 * mmCIF is line-oriented and its first meaningful line is a `data_` block
 * header (comments and blank lines may precede it); PDB has none.
 */
export declare function structureFormatFromContent(data: string): BuiltInTrajectoryFormat;
export declare function structureFormatFor({ url, data, }: {
    url?: string;
    data?: string;
}): BuiltInTrajectoryFormat;
