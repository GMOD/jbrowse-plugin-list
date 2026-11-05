import type { FileLocation } from '@jbrowse/core/util/types';
/**
 * Maps every protein id in OrthoFinder's `Orthogroups/Orthogroups.tsv` to its
 * orthogroup. Each id is also listed without a trailing `.N` version, since a
 * proteome FASTA usually versions its ids where the matching GFF does not
 * (Ensembl's `ENSP00000269305.4` against `protein_id=ENSP00000269305`).
 */
export declare function parseOrthogroups(tsv: string): Map<string, string>;
/**
 * OrthoFinder 3 writes every gene tree into one
 * `Resolved_Gene_Trees/Resolved_Gene_Trees.txt`, a line per orthogroup of the
 * form `OG0000055: (newick);`
 */
export declare function parseResolvedGeneTrees(text: string): Map<string, string>;
/** a file inside the results folder, addressed the same way the folder is */
export declare function resultsFile(results: FileLocation, path: string): FileLocation;
