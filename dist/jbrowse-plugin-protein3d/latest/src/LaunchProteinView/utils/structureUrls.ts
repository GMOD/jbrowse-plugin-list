// Pure structure-URL builders and target parsers. Kept dependency-free so both
// the launch flow and the ProteinView model (e.g. resolving a `uniprotId`/`pdbId`
// shorthand at hydration) can import them without pulling in heavy launch code.

const ALPHAFOLD_VERSION = 'v6'

// UniProt endpoints. rest.* is the machine API (the GFF the feature tracks and
// the alignment's annotation rows both read, the FASTA the temporary protein
// assembly is built from); www.*/entry is the human-facing entry page the UI
// links to. Centralized so a path change is one edit rather than a grep.
export function uniprotGffUrl(uniprotId: string) {
  return `https://rest.uniprot.org/uniprotkb/${uniprotId}.gff`
}

export function uniprotFastaUrl(uniprotId: string) {
  return `https://rest.uniprot.org/uniprotkb/${uniprotId}.fasta`
}

export function uniprotEntryUrl(uniprotId: string) {
  return `https://www.uniprot.org/uniprotkb/${uniprotId}/entry`
}

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

export function getPdbStructureUrl(pdbId: string) {
  return `https://files.rcsb.org/download/${pdbId}.cif`
}

/**
 * Resolve the `{ uniprotId }` / `{ pdbId }` shorthand to a concrete structure
 * URL, so a hand-authored snapshot or a short launch URL doesn't have to know
 * the AlphaFold/RCSB filename formats.
 *
 * An explicit `url` (or inline `data`) always wins, and the shorthand resolves
 * the canonical form only — AlphaFold's F1 fragment, RCSB's mmCIF. Idempotent:
 * re-resolving an already-resolved spec returns the same url.
 *
 * Shared by the Structure model's snapshot preprocessor and the
 * LaunchView-ProteinView extension point, which would otherwise each carry
 * their own copy of the same precedence rule and drift on which ids they
 * accept — the extension point took uniprotId but not pdbId for exactly that
 * reason.
 */
export function resolveStructureUrl({
  url,
  data,
  uniprotId,
  pdbId,
}: {
  url?: string
  data?: string
  uniprotId?: string
  pdbId?: string
}) {
  if (url !== undefined || data !== undefined) {
    return url
  }
  if (uniprotId !== undefined) {
    return getAlphaFoldStructureUrl(uniprotId)
  }
  return pdbId === undefined ? undefined : getPdbStructureUrl(pdbId)
}

// Hosts that serve the PDB archive, so a 4-character filename there really is
// that PDB entry. Restricted deliberately: a user-uploaded model happening to be
// named 1abc.cif must not pick up 1ABC's UniProt annotations.
const PDB_ARCHIVE_HOSTS = ['files.rcsb.org', 'www.ebi.ac.uk', 'ftp.ebi.ac.uk']

/**
 * The PDB id of a structure URL from the PDB archive, lowercased, or undefined
 * for any other URL. Accepts the filename forms those hosts serve, e.g.
 * `1TUP.cif`, `pdb1tup.ent.gz`, `1tup_updated.cif`.
 */
export function getPdbIdFromUrl(url: string) {
  const { host, file } = (() => {
    try {
      const parsed = new URL(url)
      return { host: parsed.hostname, file: parsed.pathname.split('/').pop() }
    } catch {
      return { host: undefined, file: undefined }
    }
  })()
  if (host === undefined || !PDB_ARCHIVE_HOSTS.includes(host)) {
    return undefined
  }
  const match =
    /^(?:pdb)?([1-9][a-z0-9]{3})(?:_updated)?\.(?:cif|bcif|pdb|ent)(?:\.gz)?$/i.exec(
      file ?? '',
    )
  return match?.[1]?.toLowerCase()
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
