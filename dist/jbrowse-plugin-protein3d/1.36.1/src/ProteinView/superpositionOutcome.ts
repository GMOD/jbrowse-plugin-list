/** Fewer traced residues than this and TM-align has too little fold to place
 * a chain by: a 10-residue peptide on an MHC groove scored 0.27. */
export const MIN_TM_ALIGN_RESIDUES = 30

/** TM-align's own threshold for two chains sharing a fold, normalised by the
 * shorter chain so a domain-sized crystal on a full-length model is not
 * penalised for the residues it never had. */
export const MIN_TM_SCORE = 0.5

/** The fewest residue pairs a fit by transcript position is trusted on. */
export const MIN_RESIDUE_PAIRS = 5

/** Identity over those pairs below which they are chance, not the same
 * protein: NRAS's transcript re-mapped to 9BTM's SHOC2 pairs 48 residues at
 * 27%, the best decoy among a ribosome's 55 chains reached 29%, and 7OW4's
 * NRAS peptide pairs 8 of 8. */
export const MIN_PAIR_IDENTITY = 0.5

export interface SuperposedChain {
  label: string
  /** author chain id of the copy aligned, absent when the whole structure is */
  chain?: string
}

export type FallbackReason =
  | { kind: 'short'; residues: number; of: SuperposedChain }
  | { kind: 'dissimilar'; tmScore: number }

export interface ResiduePairs {
  count: number
  /** the fraction of pairs whose two residues are the same amino acid */
  identity: number
}

export interface ResiduePairFit extends ResiduePairs {
  rmsd: number
}

export type SuperpositionOutcome =
  | {
      method: 'tm-align'
      structure: SuperposedChain
      pivot: SuperposedChain
      tmScore: number
      rmsd: number
      alignedLength: number
      pairs?: ResiduePairFit
    }
  | {
      method: 'residue-pairs'
      structure: SuperposedChain
      pivot: SuperposedChain
      reason: FallbackReason
      pairs: ResiduePairFit
    }
  | {
      method: 'unmoved'
      structure: SuperposedChain
      pivot: SuperposedChain
      reason: FallbackReason
      pairs: ResiduePairs
    }

/**
 * Why TM-align's placement is not to be used, if it is not: either chain too
 * short to have a fold, or a TM-score two unrelated folds reach. Both checks
 * need the residue pairs to fall back on, so only chains mapped to the
 * transcript are judged.
 */
export function shortChain(
  pivot: SuperposedChain & { residues: number },
  structure: SuperposedChain & { residues: number },
): FallbackReason | undefined {
  const shorter = structure.residues <= pivot.residues ? structure : pivot
  return shorter.residues < MIN_TM_ALIGN_RESIDUES
    ? {
        kind: 'short',
        residues: shorter.residues,
        of: { label: shorter.label, chain: shorter.chain },
      }
    : undefined
}

export function dissimilarFold(tmScore: number): FallbackReason | undefined {
  return tmScore < MIN_TM_SCORE ? { kind: 'dissimilar', tmScore } : undefined
}

export function pairsCorrespond({ count, identity }: ResiduePairs) {
  return count >= MIN_RESIDUE_PAIRS && identity >= MIN_PAIR_IDENTITY
}

export function chainName({ label, chain }: SuperposedChain) {
  return chain ? `${label} chain ${chain}` : label
}

function reasonText(reason: FallbackReason) {
  return reason.kind === 'short'
    ? `${chainName(reason.of)} has ${reason.residues} traced residues, too few for TM-align to place it`
    : `TM-align found no shared fold (TM-score ${reason.tmScore.toFixed(2)}, under ${MIN_TM_SCORE})`
}

/**
 * The superposition in a sentence, for the Mol* log and the header's tooltip.
 */
export function describeSuperposition(outcome: SuperpositionOutcome) {
  const mobile = chainName(outcome.structure)
  const pivot = chainName(outcome.pivot)
  if (outcome.method === 'tm-align') {
    const { tmScore, rmsd, alignedLength, pairs } = outcome
    return `Superposed ${mobile} on ${pivot} by TM-align: TM-score ${tmScore.toFixed(2)}, RMSD ${rmsd.toFixed(2)} Å over ${alignedLength} aligned residues${
      pairs
        ? `; ${pairs.count} residues aligned to the same transcript position sit ${pairs.rmsd.toFixed(2)} Å apart`
        : ''
    }.`
  }
  if (outcome.method === 'residue-pairs') {
    const { reason, pairs } = outcome
    return `${reasonText(reason)}, so ${mobile} was superposed on ${pivot} by the ${pairs.count} residues aligned to the same transcript positions (RMSD ${pairs.rmsd.toFixed(2)} Å).`
  }
  const { count, identity } = outcome.pairs
  const why =
    count < MIN_RESIDUE_PAIRS
      ? `only ${count} residues align to the same transcript positions as ${pivot}'s`
      : `the ${count} residues aligned to the same transcript positions as ${pivot}'s are ${Math.round(identity * 100)}% identical, under the ${MIN_PAIR_IDENTITY * 100}% that says they are the same protein's`
  return `${reasonText(outcome.reason)}, and ${why}, so ${mobile} was left where its file places it.`
}

/** The header chip's text, for a superposition the reader should know of. */
export function superpositionChip(outcome: SuperpositionOutcome | undefined) {
  return outcome?.method === 'residue-pairs'
    ? `fit on ${outcome.pairs.count} residues`
    : outcome?.method === 'unmoved'
      ? 'not superposed'
      : undefined
}
