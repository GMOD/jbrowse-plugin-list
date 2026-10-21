import { placeValues } from './variantEffects'

import type { ResidueValues } from './proteinColor'
import type { PlacedValues } from './variantEffects'

/** A session's values by 0-based transcript position. */
export function valuesByPosition(values: ResidueValues) {
  const byPosition = new Map<number, number>()
  const entries: [string, number | null][] = Array.isArray(values)
    ? values.map((v, i): [string, number | null] => [String(i + 1), v])
    : Object.entries(values)
  for (const [residue, value] of entries) {
    if (value !== null) {
      byPosition.set(Number(residue) - 1, value)
    }
  }
  return byPosition
}

export interface ResidueValuesStatus {
  placed?: PlacedValues
  message?: string
}

/**
 * The residue numbers a session gives, counted on the transcript's protein,
 * placed on the mapped entity through the structure's alignment to that
 * transcript. Waits, with no message, for the alignment.
 */
export function residueValuesStatus({
  values,
  entity,
  transcriptToStructure,
}: {
  values: ResidueValues | undefined
  entity: { entityId: string; seqIds: readonly number[] } | undefined
  transcriptToStructure: Record<number, number> | undefined
}): ResidueValuesStatus {
  if (!values) {
    return { message: 'No values to color the residues by' }
  }
  if (!entity || !transcriptToStructure) {
    return {}
  }
  const placed = placeValues(
    valuesByPosition(values),
    pos => transcriptToStructure[pos],
    entity,
  )
  return placed.byLabelSeqId.size > 0
    ? { placed }
    : { message: "None of the values fall on this structure's residues" }
}
