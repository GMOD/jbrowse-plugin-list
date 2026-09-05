import type { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory'

/**
 * Which molstar trajectory parser a structure needs.
 *
 * Getting this wrong is not a graceful failure in either direction: parsing a
 * PDB file as mmCIF throws ("Unexpected token. Expected data_, loop_, or data
 * name"), and — worse — parsing an mmCIF as PDB *succeeds* and yields a model
 * with zero polymer entities and thousands of misread atoms, so the view loads
 * with no sequence, no alignment and no genome mapping, and nothing reports an
 * error.
 *
 * So detection lives here and is applied as the default at every entry point,
 * rather than at one of them.
 */

// Only the PDB set is enumerated: mmCIF is the fallback (see below), so listing
// its extensions would be a second source of truth that could disagree.
const PDB_EXTENSIONS = new Set(['pdb', 'ent', 'pdb1', 'pdb2', 'pdb3'])

/** Trailing extension of a filename or URL, lowercased, ignoring any query or
 * fragment and any `.gz` wrapper (`…/pdb1tup.ent.gz` -> `ent`). */
export function structureFileExtension(nameOrUrl: string) {
  const path = nameOrUrl.split(/[?#]/)[0] ?? ''
  const name = path.split('/').pop() ?? ''
  const parts = name.toLowerCase().split('.')
  if (parts.at(-1) === 'gz') {
    parts.pop()
  }
  return parts.length > 1 ? (parts.at(-1) ?? '') : ''
}

/**
 * Format for a filename or URL. Unknown extensions fall back to mmCIF, which is
 * what every URL this plugin generates itself serves (AlphaFold and RCSB both
 * hand out `.cif`).
 */
export function structureFormatFromName(
  nameOrUrl: string,
): BuiltInTrajectoryFormat {
  return PDB_EXTENSIONS.has(structureFileExtension(nameOrUrl)) ? 'pdb' : 'mmcif'
}

/** Whether a URL points at a binary-encoded structure, which molstar must be
 * told to download as bytes rather than text. */
export function isBinaryStructureUrl(url: string) {
  return structureFileExtension(url) === 'bcif'
}

/**
 * Format for structure text that arrived without a filename — an inline `data`
 * snapshot, a pasted file, or the PDB the plugin synthesizes from Foldseek Cα
 * coordinates. Sniffs the content, which is strictly more reliable than a name
 * and is the only signal available here.
 *
 * mmCIF is line-oriented and its first meaningful line is a `data_` block
 * header (comments and blank lines may precede it); PDB has none.
 */
export function structureFormatFromContent(
  data: string,
): BuiltInTrajectoryFormat {
  // a data_ header can only appear in the first few lines; don't scan a 30MB
  // structure to find out
  for (const line of data.slice(0, 4096).split('\n')) {
    const trimmed = line.trim()
    if (trimmed !== '' && !trimmed.startsWith('#')) {
      return trimmed.toLowerCase().startsWith('data_') ? 'mmcif' : 'pdb'
    }
  }
  return 'pdb'
}
