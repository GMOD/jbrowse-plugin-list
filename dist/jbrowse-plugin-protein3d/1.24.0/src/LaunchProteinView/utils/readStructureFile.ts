/** Text of a structure file the user picked, inflating a `.gz` first. Every
 * supported browser has DecompressionStream, and the PDB archive hands out
 * `pdb1tup.ent.gz`, so a picker that lists `.gz` has to actually read one. */
export async function readStructureFile(file: File) {
  if (!file.name.toLowerCase().endsWith('.gz')) {
    return file.text()
  }
  const inflated = file.stream().pipeThrough(new DecompressionStream('gzip'))
  return new Response(inflated).text()
}

export const STRUCTURE_FILE_ACCEPT =
  '.pdb,.cif,.mmcif,.ent,.pdb.gz,.cif.gz,.mmcif.gz,.ent.gz'
