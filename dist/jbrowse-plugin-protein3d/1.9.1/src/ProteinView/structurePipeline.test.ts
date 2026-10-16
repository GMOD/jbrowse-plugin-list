// @vitest-environment jsdom
import { expect, test } from 'vitest'

import { parseStructureTrajectory } from './structurePipeline'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'
import { loadCaOnly } from '../test_data/molstarPlugin'

const chain = { asym: 'A', entity: '1', residues: ['MET', 'LYS', 'ALA'] }

// The load used to build a model of its own before the preset built another
// over the same Model object: a second "Model 1" in Mol*'s state tree, and a
// node whose removal would dispose the live model's custom properties.
test('a load leaves one model per model of the file', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const loaded = await loadCaOnly(plugin, [chain])
    expect(plugin.managers.structure.hierarchy.current.models).toHaveLength(1)
    expect(loaded.structures).toHaveLength(1)
    expect(loaded.model?.obj?.data).toBe(loaded.structures[0]?.model)
  })
})

// Only the first of an NMR ensemble's structures used to come back, so
// everything addressed through it reached one model in twenty.
test('an ensemble load returns every model it made', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const loaded = await loadCaOnly(plugin, [chain], { models: 4 })
    expect(plugin.managers.structure.hierarchy.current.models).toHaveLength(4)
    expect(loaded.structures).toHaveLength(4)
    expect(new Set(loaded.modelIds).size).toBe(4)
  })
})

// Mol* reverts a parse that fails and resolves with no trajectory, which used
// to surface as "Cannot read properties of undefined (reading 'ref')".
test('a file with no model says so, and names the parser it tried', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    await expect(
      parseStructureTrajectory({
        plugin,
        data: 'data_EMPTY\n_entry.id EMPTY\n',
      }),
    ).rejects.toThrow('No model could be read from the structure data as mmcif')
    await expect(
      parseStructureTrajectory({ plugin, data: 'not a structure\n' }),
    ).rejects.toThrow('No model could be read from the structure data as pdb')
  })
})
