import { errorMessage } from './util'
import {
  VARIANT_EFFECT_SOURCE_NAMES,
  VariantEffectRefusal,
  placeValues,
} from './variantEffects'

import type {
  VariantEffectAsk,
  VariantEffectState,
} from './variantEffectLoader'
import type { PlacedValues } from './variantEffects'
import type { MapUniProtPosition } from 'p2s_mapper'

export interface VariantEffectStatus {
  /**
   * Whether the values are still on their way. Kept out of a structure's
   * `loading`: colour arriving late only recolours, so selection, framing and
   * the ready marker do not wait on it.
   */
  pending: boolean
  /** the values on the mapped entity's residues, by label_seq_id */
  placed?: PlacedValues
  /** why the scheme leaves this structure grey, once that is settled */
  message?: string
}

/**
 * Where a structure's variant-effect request stands, and its answer placed on
 * the mapped entity. Each source is placed through the coordinate it numbers:
 * a UniProt position through the entry's map (one to one for an AlphaFold
 * model, SIFTS' segments for a PDB entry), a transcript residue through the
 * structure's alignment to the transcript. Either places only what its map
 * reaches.
 *
 * A model mapped to its entry one to one whose chain spells another sequence
 * than the source numbers (an AlphaFold model of an older revision) would
 * take every value a residue off and nothing else would say so, so it stays
 * grey with a message. A PDB entry goes through SIFTS, which maps the
 * construct to the current entry, and an alignment needs no such check.
 */
export function variantEffectStatus({
  ask,
  state,
  entity,
  pdbId,
  mapUniProtPosition,
  transcriptToStructure,
}: {
  ask: VariantEffectAsk | undefined
  state: VariantEffectState | undefined
  entity:
    { entityId: string; seq: string; seqIds: readonly number[] } | undefined
  pdbId: string | undefined
  mapUniProtPosition: MapUniProtPosition
  transcriptToStructure: Record<number, number> | undefined
}): VariantEffectStatus {
  if (ask?.status !== 'ready') {
    return {
      pending: ask?.status === 'waiting',
      message: ask?.status === 'unavailable' ? ask.reason : undefined,
    }
  }
  const { request } = ask
  const answer = state?.key === request.key ? state : undefined
  const source = VARIANT_EFFECT_SOURCE_NAMES[request.scheme]
  const { error } = answer ?? {}
  if (error !== undefined) {
    return {
      pending: false,
      message:
        error instanceof VariantEffectRefusal
          ? error.message
          : `Could not fetch ${source} for ${request.label}: ${errorMessage(error)}`,
    }
  }
  const values = answer?.values
  if (!values) {
    return { pending: true }
  }
  if (
    values.numbering === 'uniprot' &&
    !pdbId &&
    entity &&
    values.sequence !== entity.seq
  ) {
    return {
      pending: false,
      message: `${source} for ${request.label} number a sequence that differs from this model's`,
    }
  }
  const toStructure =
    values.numbering === 'uniprot'
      ? mapUniProtPosition
      : transcriptToStructure &&
        ((position: number) => transcriptToStructure[position])
  return {
    pending: false,
    placed:
      entity && toStructure
        ? placeValues(values.byPosition, toStructure, entity)
        : undefined,
  }
}
