import type { FileLocation } from '@jbrowse/core/util/types';
export interface ProteinEntry {
    orthogroup: string;
    /** the id as OrthoFinder wrote it, which names the protein's alignment row */
    id: string;
}
/**
 * OrthoFinder's `Orthogroups/Orthogroups.tsv`, one map per species column from
 * protein id to its orthogroup. Per species because OrthoFinder leaves a name
 * two species share unprefixed there: human's `ADAM32` and chicken's are
 * different genes in different orthogroups. Each id is also listed without a
 * trailing `.N` version, since a proteome FASTA usually versions its ids where
 * the matching GFF does not (Ensembl's `ENSP00000269305.4` against
 * `protein_id=ENSP00000269305`).
 */
export declare function parseOrthogroups(tsv: string): Map<string, Map<string, ProteinEntry>>;
/**
 * The alignment and tree name each protein `<species>_<id>`, the species with
 * `.` and space made `_` (OrthoFinder's species_prefixes).
 */
export declare function alignmentRowName(species: string, id: string): string;
/** a file the results folder does not hold, as opposed to one it failed to serve */
export declare function isMissingFile(e: unknown): boolean;
/**
 * OrthoFinder 3 writes every gene tree into one
 * `Resolved_Gene_Trees/Resolved_Gene_Trees.txt`, a line per orthogroup of the
 * form `OG0000055: (newick);`
 */
export declare function parseResolvedGeneTrees(text: string): Map<string, string>;
/** a file inside the results folder, addressed the same way the folder is */
export declare function resultsFile(results: FileLocation, path: string): FileLocation;
