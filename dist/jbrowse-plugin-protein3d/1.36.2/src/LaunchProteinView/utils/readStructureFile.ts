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

/** Past this many characters a session carrying a file's text grows heavy to
 * save, share and reopen */
export const LARGE_STRUCTURE_TEXT = 20_000_000

/** A file's size as a person reads it: 840 kB, 3.2 MB */
export function formatFileSize(bytes: number) {
  return bytes < 1_000_000
    ? `${Math.max(1, Math.round(bytes / 1000))} kB`
    : `${(bytes / 1_000_000).toFixed(1)} MB`
}

export const STRUCTURE_FILE_ACCEPT =
  '.pdb,.cif,.mmcif,.ent,.pdb.gz,.cif.gz,.mmcif.gz,.ent.gz'
