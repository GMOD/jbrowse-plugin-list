/** Text of a structure file the user picked, inflating a `.gz` first. Every
 * supported browser has DecompressionStream, and the PDB archive hands out
 * `pdb1tup.ent.gz`, so a picker that lists `.gz` has to actually read one. */
export declare function readStructureFile(file: File): Promise<string>;
export declare const STRUCTURE_FILE_ACCEPT = ".pdb,.cif,.mmcif,.ent,.pdb.gz,.cif.gz,.mmcif.gz,.ent.gz";
