// @vitest-environment jsdom
import { expect, test } from 'vitest'

import { removeMolstarStructure } from './removeStructure'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'
import { loadCaOnly } from '../test_data/molstarPlugin'

import type { PluginContext } from 'molstar/lib/mol-plugin/context'

const chain = { asym: 'A', entity: '1', residues: ['MET', 'LYS', 'ALA'] }

// every cell but the state tree's root
const cellCount = (plugin: PluginContext) => plugin.state.data.cells.size - 1

// Removing the trajectory alone left the pasted or downloaded file and its
// parse in the state tree, one copy per structure ever removed.
test('a removal leaves nothing of the load behind', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { structures } = await loadCaOnly(plugin, [chain], { models: 3 })
    expect(cellCount(plugin)).toBeGreaterThan(0)
    await removeMolstarStructure({ plugin, molstarStructure: structures[0] })
    expect(cellCount(plugin)).toBe(0)
  })
})

test('a removal leaves the other loads as they were', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const kept = await loadCaOnly(plugin, [chain])
    const keptCells = cellCount(plugin)
    const removed = await loadCaOnly(plugin, [chain])
    await removeMolstarStructure({
      plugin,
      molstarStructure: removed.structures[0],
    })
    expect(cellCount(plugin)).toBe(keptCells)
    expect(
      plugin.helpers.substructureParent.get(kept.structures[0]!),
    ).toBeDefined()
  })
})

// The loader removes a structure the moment its load lands if the view dropped
// it meanwhile, which is exactly when Mol*'s published hierarchy can lag.
test('a structure the published hierarchy has not caught up with is removed', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    await plugin.dataTransaction(async () => {
      const { structures } = await loadCaOnly(plugin, [chain])
      await removeMolstarStructure({ plugin, molstarStructure: structures[0] })
    })
    expect(cellCount(plugin)).toBe(0)
  })
})
