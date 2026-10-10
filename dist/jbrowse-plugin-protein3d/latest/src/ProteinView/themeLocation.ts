import { Bond, StructureElement, Unit } from 'molstar/lib/mol-model/structure'

import type { Location } from 'molstar/lib/mol-model/location'
import type { Structure } from 'molstar/lib/mol-model/structure'

/**
 * Reads the atomic residue a theme is asked to colour: an element directly,
 * or a bond by its first end. A coarse or non-structure location reads as
 * undefined. The returned location is reused between calls.
 */
export function atomicLocationReader(structure: Structure | undefined) {
  const bondEnd = structure
    ? StructureElement.Location.create(structure.root)
    : undefined
  return function atomicLocation(location: Location) {
    let l: StructureElement.Location | undefined
    if (StructureElement.Location.is(location)) {
      l = location
    } else if (bondEnd && Bond.isLocation(location)) {
      const element = location.aUnit.elements[location.aIndex]
      if (element !== undefined) {
        bondEnd.unit = location.aUnit
        bondEnd.element = element
        l = bondEnd
      }
    }
    return l && Unit.isAtomic(l.unit) ? l : undefined
  }
}
