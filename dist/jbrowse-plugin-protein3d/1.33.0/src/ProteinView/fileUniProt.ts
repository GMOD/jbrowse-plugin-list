import { entityUniProtMappings } from 'p2s_mapper'

import type { Entity } from 'p2s_mapper'

const ISOFORM_SUFFIX = /-\d+$/

/**
 * The UniProt mappings a model file states for its entities, as SIFTS would
 * give them, so whichever chain the transcript maps to names its own protein.
 * An isoform's entry publishes no features of its own and its AlphaMissense
 * scores number the canonical entry, so an isoform reference places nothing.
 */
export function fileUniProtMappings(entities: readonly Entity[] | undefined) {
  return entityUniProtMappings(entities ?? []).filter(
    m => !ISOFORM_SUFFIX.test(m.accession),
  )
}

/**
 * The proteins of a complex as its file names them, `GSTM1 + GSTP1` or
 * `SOD1 ×2`, so the view header says what the structure is rather than a
 * model id. Undefined until the file is loaded or when it names no gene.
 */
export function complexMembersLabel(entities: readonly Entity[] | undefined) {
  const members = (entities ?? []).flatMap(e => {
    const name = e.uniProt?.gene ?? e.uniProt?.accession
    return name
      ? [e.chains.length > 1 ? `${name} ×${e.chains.length}` : name]
      : []
  })
  return members.length > 0 ? members.join(' + ') : undefined
}
