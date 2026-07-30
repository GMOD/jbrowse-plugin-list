// Pure structure-URL builders and target parsers. Kept dependency-free so both
// the launch flow and the ProteinView model (e.g. resolving a `uniprotId`/`pdbId`
// shorthand at hydration) can import them without pulling in heavy launch code.

export const ALPHAFOLD_VERSION = 'v6'

export function getAlphaFoldStructureUrl(
  uniprotId: string,
  version = ALPHAFOLD_VERSION,
) {
  return `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-model_${version}.cif`
}

export function getAlphaFoldConfidenceUrl(
  uniprotId: string,
  version = ALPHAFOLD_VERSION,
) {
  return `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-confidence_${version}.json`
}

export function getAlphaFoldMsaUrl(
  uniprotId: string,
  version = ALPHAFOLD_VERSION,
) {
  return `https://alphafold.ebi.ac.uk/files/msa/AF-${uniprotId}-F1-msa_${version}.a3m`
}

export function getPdbStructureUrl(pdbId: string) {
  return `https://files.rcsb.org/download/${pdbId}.cif`
}

// Foldseek targets may contain a description after the ID separated by a
// space, e.g. "AF-P16442-F1-model_v6 Histo-blood group ABO transferase".
function extractTargetId(target: string) {
  return target.split(' ')[0]!
}

export function getUniprotIdFromAlphaFoldTarget(target: string) {
  // Handles both "AF-P16442-F1-model_v6" and full URLs like
  // "https://alphafold.ebi.ac.uk/files/AF-P16442-F1-model_v6.cif"
  const match = /AF-([A-Z0-9]+)-F\d+/.exec(extractTargetId(target))
  return match?.[1]
}

export function getStructureUrlFromTarget(target: string, db: string) {
  const targetId = extractTargetId(target)
  if (targetId.startsWith('AF-')) {
    return `https://alphafold.ebi.ac.uk/files/${targetId}.cif`
  }
  if (db === 'pdb100') {
    const pdbId = targetId.split('_')[0]!
    if (pdbId.length === 4) {
      return getPdbStructureUrl(pdbId)
    }
  }
  return undefined
}

export function getConfidenceUrlFromTarget(target: string) {
  const targetId = extractTargetId(target)
  if (targetId.startsWith('AF-')) {
    const confidenceId = targetId.replace('-model_', '-confidence_')
    return `https://alphafold.ebi.ac.uk/files/${confidenceId}.json`
  }
  return undefined
}
