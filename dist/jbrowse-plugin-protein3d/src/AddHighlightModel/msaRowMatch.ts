/** Removes alignment gap characters ('-' and '.') from an MSA row sequence. */
export function ungap(seq: string) {
  return seq.replace(/[-.]/g, '')
}

/**
 * Finds the MSA row whose ungapped sequence equals the structure's sequence.
 * For AlphaFold structures the structure sequence is the same UniProt sequence
 * as the MSA query row, so this anchors the structure to its alignment row
 * independent of row naming/ordering. Returns undefined when no row matches
 * (e.g. MSA not yet loaded), letting callers fall back to a 1:1 mapping.
 */
export function findStructureRowName(
  rowMap: Map<string, string> | undefined,
  structureSeq: string | undefined,
): string | undefined {
  return rowMap && structureSeq
    ? [...rowMap].find(([, seq]) => ungap(seq) === structureSeq)?.[0]
    : undefined
}
