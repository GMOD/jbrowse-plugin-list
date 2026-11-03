// @vitest-environment jsdom
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { StateSelection } from 'molstar/lib/mol-state'
import { expect, test } from 'vitest'

import { superposeStructures } from './superposeStructures'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'
import { loadCaOnly } from '../test_data/molstarPlugin'

import type { PluginContext } from 'molstar/lib/mol-plugin/context'

const chain = {
  asym: 'A',
  entity: '1',
  residues: Array.from({ length: 30 }, () => 'ALA'),
}

// the superposition transforms in the state tree, as their matrices
function transforms(plugin: PluginContext) {
  return plugin.state.data
    .select(
      StateSelection.Generators.ofTransformer(
        StateTransforms.Model.TransformStructureConformation,
      ),
    )
    .map(cell => {
      const t = cell.transform.params?.transform
      return t?.name === 'matrix' ? Array.from(t.params.data) : undefined
    })
}

// Mol*'s own structure list holds an ensemble's models as separate structures,
// and superposing from it TM-aligned each of an NMR entry's twenty models on
// its own, onto its sibling.
test('an ensemble moves as one unit, by one transform', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const pivot = await loadCaOnly(plugin, [chain])
    const ensemble = await loadCaOnly(plugin, [chain], { models: 4 })
    await superposeStructures(plugin, [pivot.structures, ensemble.structures])
    const moved = transforms(plugin)
    expect(moved).toHaveLength(4)
    expect(new Set(moved.map(m => JSON.stringify(m))).size).toBe(1)
  })
})

// Superposition runs as soon as a second structure has loaded, which is when
// Mol*'s published hierarchy can lag; found through it, the newcomer was
// skipped and left where it loaded.
test('a structure the published hierarchy has not caught up with is moved', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    await plugin.dataTransaction(async () => {
      const pivot = await loadCaOnly(plugin, [chain])
      const other = await loadCaOnly(plugin, [chain])
      await superposeStructures(plugin, [pivot.structures, other.structures])
    })
    expect(transforms(plugin)).toHaveLength(1)
  })
})

test('an ensemble as the pivot stays where it is', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const ensemble = await loadCaOnly(plugin, [chain], { models: 4 })
    const single = await loadCaOnly(plugin, [chain])
    await superposeStructures(plugin, [ensemble.structures, single.structures])
    expect(transforms(plugin)).toHaveLength(1)
  })
})
