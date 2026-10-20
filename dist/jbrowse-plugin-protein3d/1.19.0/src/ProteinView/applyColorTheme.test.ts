// @vitest-environment jsdom
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { StateSelection } from 'molstar/lib/mol-state'
import { expect, test } from 'vitest'

import { applyColorTheme, colorLegendOf } from './applyColorTheme'
import { registerColorThemes } from './colorThemes'
import { MAPPED_CHAIN_COLOR, OTHER_CHAIN_COLOR } from './mappedChainColorTheme'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'
import { loadCaOnly } from '../test_data/molstarPlugin'

import type { ProteinColor } from './proteinColor'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

const chain = { asym: 'A', entity: '1', residues: ['MET', 'LYS', 'ALA'] }

// every representation in the plugin, as the color theme it carries
function themes(plugin: PluginContext) {
  return plugin.state.data
    .select(
      StateSelection.Generators.ofTransformer(
        StateTransforms.Representation.StructureRepresentation3D,
      ),
    )
    .map(cell => cell.transform.params?.colorTheme)
}

test('applies the chosen theme to every loaded structure', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const a = await loadCaOnly(plugin, [chain])
    const b = await loadCaOnly(plugin, [chain])
    await applyColorTheme({
      plugin,
      color: { field: 'secondaryStructure' },
      structures: [...a.structures, ...b.structures].map(molstarStructure => ({
        molstarStructure,
      })),
    })
    const names = themes(plugin).map(t => t?.name)
    expect(names).toHaveLength(2)
    expect(new Set(names)).toEqual(new Set(['secondary-structure']))
  })
})

test("colors each structure's own mapped chain", async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    registerColorThemes(plugin)
    const a = await loadCaOnly(plugin, [chain])
    const b = await loadCaOnly(plugin, [chain])
    await applyColorTheme({
      plugin,
      color: { field: 'mappedChain' },
      structures: [
        { molstarStructure: a.structures[0]!, entityId: '1' },
        { molstarStructure: b.structures[0]!, entityId: '3' },
      ],
    })
    expect(themes(plugin)).toEqual([
      { name: 'mapped-chain', params: { entityId: '1' } },
      { name: 'mapped-chain', params: { entityId: '3' } },
    ])
  })
})

// Mol*'s own `hydrophobicity` theme is Wimley-White, while the menu and the
// alignment strip say Kyte-Doolittle.
test('hydrophobicity draws with the Kyte-Doolittle theme', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    registerColorThemes(plugin)
    const { structures } = await loadCaOnly(plugin, [chain])
    await applyColorTheme({
      plugin,
      color: { field: 'hydrophobicity' },
      structures: structures.map(molstarStructure => ({ molstarStructure })),
    })
    expect(themes(plugin).map(t => t?.name)).toEqual(['kyte-doolittle'])
  })
})

test("no field puts each representation's own default theme back", async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { structures } = await loadCaOnly(plugin, [chain])
    const loaded = structures.map(molstarStructure => ({ molstarStructure }))
    const [original] = themes(plugin)
    await applyColorTheme({
      plugin,
      color: { field: 'secondaryStructure' },
      structures: loaded,
    })
    await applyColorTheme({
      plugin,
      color: {},
      structures: loaded,
    })
    expect(themes(plugin)).toEqual([original])
  })
})

// An NMR ensemble loads as one Mol* structure per model. Recoloring only the
// first left the other models on the preset's per-model colors, so on a
// 20-model entry a chosen scheme looked as if it had not applied.
test('recolors every model of an ensemble', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { structures } = await loadCaOnly(plugin, [chain], { models: 4 })
    await applyColorTheme({
      plugin,
      color: { field: 'secondaryStructure' },
      structures: structures.map(molstarStructure => ({ molstarStructure })),
    })
    const names = themes(plugin).map(t => t?.name)
    expect(names).toHaveLength(4)
    expect(new Set(names)).toEqual(new Set(['secondary-structure']))
  })
})

// Mol* publishes its structure hierarchy only on some state events and on none
// while a data transaction is open anywhere in the plugin. Found through it, a
// structure loaded meanwhile was skipped and kept its old colors.
test('recolors a structure the published hierarchy has not caught up with', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    await plugin.dataTransaction(async () => {
      const { structures } = await loadCaOnly(plugin, [chain])
      await applyColorTheme({
        plugin,
        color: { field: 'secondaryStructure' },
        structures: structures.map(molstarStructure => ({ molstarStructure })),
      })
    })
    expect(themes(plugin).map(t => t?.name)).toEqual(['secondary-structure'])
  })
})

test('skips a structure molstar no longer holds', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const gone = await loadCaOnly(plugin, [chain])
    await plugin.clear()
    const kept = await loadCaOnly(plugin, [chain])
    await applyColorTheme({
      plugin,
      color: { field: 'secondaryStructure' },
      structures: [...gone.structures, ...kept.structures].map(
        molstarStructure => ({ molstarStructure }),
      ),
    })
    expect(themes(plugin).map(t => t?.name)).toEqual(['secondary-structure'])
  })
})

test("each field's legend is the key of the theme that draws it", async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    registerColorThemes(plugin)
    const [structure] = (await loadCaOnly(plugin, [chain])).structures
    if (!structure) {
      throw new Error('no structure loaded')
    }
    const legend = (color: ProteinColor) =>
      colorLegendOf({ plugin, color, structure, entityId: '1' })
    expect(legend({})).toBeUndefined()
    expect(legend({ field: 'hydrophobicity' })).toMatchObject({
      kind: 'scale-legend',
      minLabel: 'Hydrophilic',
      maxLabel: 'Hydrophobic',
    })
    expect(legend({ field: 'mappedChain' })).toEqual({
      kind: 'table-legend',
      table: [
        ['Mapped chain', MAPPED_CHAIN_COLOR],
        ['Other', OTHER_CHAIN_COLOR],
      ],
    })
  })
})
