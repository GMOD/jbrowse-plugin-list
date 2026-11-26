import { structureRepresentations, structureRootCell } from './structureCells'

import type { Structure, Unit } from 'molstar/lib/mol-model/structure'
import type { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects'
import type { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { StateSelection } from 'molstar/lib/mol-state'

/** label_seq_ids by entity id */
export type ResidueIdsByEntity = ReadonlyMap<string, ReadonlySet<number>>

function addAtomicUnit(byEntity: Map<string, Set<number>>, unit: Unit.Atomic) {
  const { chains, residues } = unit.model.atomicHierarchy
  const { elements, chainIndex, residueIndex } = unit
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i]!
    const entityId = chains.label_entity_id.value(chainIndex[element]!)
    let ids = byEntity.get(entityId)
    if (!ids) {
      ids = new Set()
      byEntity.set(entityId, ids)
    }
    ids.add(residues.label_seq_id.value(residueIndex[element]!))
  }
}

/**
 * The residues a load's representations draw, which a color theme is asked to
 * paint: the preset's polymer, ligands and branched sugars, narrowed to a
 * spec's chains and filter, without the waters the pipeline drops or residues
 * the file has no coordinates for. The view's own marks are left out, as they
 * keep their own colors. An assembly's copies of a chain share their units'
 * residues, so each invariant unit is read once.
 */
export function drawnResidueIds(
  plugin: PluginContext,
  molstar: {
    PluginStateObject: typeof PluginStateObject
    StateSelection: typeof StateSelection
    StateTransforms: typeof StateTransforms
    Unit: typeof Unit
  },
  structures: readonly Structure[],
): ResidueIdsByEntity {
  const byEntity = new Map<string, Set<number>>()
  for (const structure of structures) {
    const root = structureRootCell(plugin, molstar, structure)
    for (const representation of root
      ? structureRepresentations(plugin, molstar, root)
      : []) {
      const drawn = representation.obj?.data.sourceData
      const read = new Set<number>()
      for (const unit of drawn?.units ?? []) {
        if (molstar.Unit.isAtomic(unit) && !read.has(unit.invariantId)) {
          read.add(unit.invariantId)
          addAtomicUnit(byEntity, unit)
        }
      }
    }
  }
  return byEntity
}
