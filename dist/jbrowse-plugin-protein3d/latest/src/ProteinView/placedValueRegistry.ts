import { StructureProperties } from 'molstar/lib/mol-model/structure'
import { Color } from 'molstar/lib/mol-util/color'

import { atomicLocationReader } from './themeLocation'

import type { PlacedValueScheme } from './applyColorTheme'
import type { PlacedValues } from './variantEffects'
import type { Location } from 'molstar/lib/mol-model/location'
import type { Model, Structure } from 'molstar/lib/mol-model/structure'

export const NO_VALUE_COLOR = Color(0xcccccc)

// Per-residue arrays do not belong in a theme's serialized params, so the
// theme looks its values up here by the Mol* model a residue belongs to. A
// superposed structure keeps its units' models, and an ensemble has one model
// per structure, so each model of every load is registered on its own.
/** a placed-value scheme, or the alignment domains' second layer */
export type PlacedValueKey = PlacedValueScheme | 'alignment-sites'

const registry = new Map<PlacedValueKey, WeakMap<Model, PlacedValues>>()

function schemeRegistry(scheme: PlacedValueKey) {
  let byModel = registry.get(scheme)
  if (!byModel) {
    byModel = new WeakMap()
    registry.set(scheme, byModel)
  }
  return byModel
}

export function registerPlacedValues(
  scheme: PlacedValueKey,
  structure: Structure,
  values: PlacedValues | undefined,
) {
  const byModel = schemeRegistry(scheme)
  for (const model of structure.models) {
    if (values) {
      byModel.set(model, values)
    } else {
      byModel.delete(model)
    }
  }
}

/**
 * Reads the value a scheme placed on the residue at a location: undefined off
 * the mapped entity, on a residue nothing placed, and on a model nobody
 * registered.
 */
export function placedValueReader(
  scheme: PlacedValueKey,
  structure: Structure | undefined,
) {
  const atomicLocation = atomicLocationReader(structure)
  const byModel = schemeRegistry(scheme)
  return function placedValue(location: Location) {
    const l = atomicLocation(location)
    const placed = l ? byModel.get(l.unit.model) : undefined
    return l &&
      placed?.entityId === StructureProperties.chain.label_entity_id(l)
      ? placed.byLabelSeqId.get(StructureProperties.residue.label_seq_id(l))
      : undefined
  }
}
