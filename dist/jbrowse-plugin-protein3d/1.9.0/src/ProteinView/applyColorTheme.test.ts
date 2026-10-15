// @vitest-environment jsdom
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { StateSelection } from 'molstar/lib/mol-state'
import { expect, test } from 'vitest'

import {
  COLOR_SCHEME_VALUES,
  applyColorTheme,
  colorSchemeLegend,
} from './applyColorTheme'
import { registerColorThemes } from './colorThemes'
import { MAPPED_CHAIN_COLOR, OTHER_CHAIN_COLOR } from './mappedChainColorTheme'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'
import { loadCaOnly } from '../test_data/molstarPlugin'

import type { ProteinColorScheme } from './applyColorTheme'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

const chain = { asym: 'A', entity: '1', residues: ['MET', 'LYS', 'ALA'] }

// every representation in the plugin, as the colour theme it carries
function themes(plugin: PluginContext) {
  return plugin.state.data
    .select(
      StateSelection.Generators.ofTransformer(
        StateTransforms.Representation.StructureRepresentation3D,
      ),
    )
    .map(cell => cell.transform.params?.colorTheme)
}

test('exposes pLDDT among the color schemes', () => {
  expect(COLOR_SCHEME_VALUES).toContain('plddt-confidence')
  expect(COLOR_SCHEME_VALUES).toContain('default')
  // scheme values are unique (no duplicate menu entries)
  expect(new Set(COLOR_SCHEME_VALUES).size).toBe(COLOR_SCHEME_VALUES.length)
})

test('applies the chosen theme to every loaded structure', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const a = await loadCaOnly(plugin, [chain])
    const b = await loadCaOnly(plugin, [chain])
    await applyColorTheme({
      plugin,
      colorScheme: 'secondary-structure',
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
      colorScheme: 'mapped-chain',
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

// Sessions persist 'hydrophobicity', which used to name Mol*'s Wimley-White
// theme while the menu and the alignment strip said Kyte-Doolittle.
test("'hydrophobicity' draws with the Kyte-Doolittle theme", async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    registerColorThemes(plugin)
    const { structures } = await loadCaOnly(plugin, [chain])
    await applyColorTheme({
      plugin,
      colorScheme: 'hydrophobicity',
      structures: structures.map(molstarStructure => ({ molstarStructure })),
    })
    expect(themes(plugin).map(t => t?.name)).toEqual(['kyte-doolittle'])
  })
})

test("'default' puts each representation's own default theme back", async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { structures } = await loadCaOnly(plugin, [chain])
    const loaded = structures.map(molstarStructure => ({ molstarStructure }))
    const [original] = themes(plugin)
    await applyColorTheme({
      plugin,
      colorScheme: 'secondary-structure',
      structures: loaded,
    })
    await applyColorTheme({
      plugin,
      colorScheme: 'default',
      structures: loaded,
    })
    expect(themes(plugin)).toEqual([original])
  })
})

// An NMR ensemble loads as one Mol* structure per model. Recoloring only the
// first left the other models on the preset's per-model colours, so on a
// 20-model entry a chosen scheme looked as if it had not applied.
test('recolors every model of an ensemble', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { structures } = await loadCaOnly(plugin, [chain], { models: 4 })
    await applyColorTheme({
      plugin,
      colorScheme: 'secondary-structure',
      structures: structures.map(molstarStructure => ({ molstarStructure })),
    })
    const names = themes(plugin).map(t => t?.name)
    expect(names).toHaveLength(4)
    expect(new Set(names)).toEqual(new Set(['secondary-structure']))
  })
})

// Mol* publishes its structure hierarchy only on some state events and on none
// while a data transaction is open anywhere in the plugin. Found through it, a
// structure loaded meanwhile was skipped and kept its old colours.
test('recolors a structure the published hierarchy has not caught up with', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    await plugin.dataTransaction(async () => {
      const { structures } = await loadCaOnly(plugin, [chain])
      await applyColorTheme({
        plugin,
        colorScheme: 'secondary-structure',
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
      colorScheme: 'secondary-structure',
      structures: [...gone.structures, ...kept.structures].map(
        molstarStructure => ({ molstarStructure }),
      ),
    })
    expect(themes(plugin).map(t => t?.name)).toEqual(['secondary-structure'])
  })
})

test("each scheme's legend is the key of the theme that draws it", async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    registerColorThemes(plugin)
    const [structure] = (await loadCaOnly(plugin, [chain])).structures
    if (!structure) {
      throw new Error('no structure loaded')
    }
    const legend = (colorScheme: ProteinColorScheme) =>
      colorSchemeLegend({ plugin, colorScheme, structure, entityId: '1' })
    expect(legend('default')).toBeUndefined()
    expect(legend('hydrophobicity')).toMatchObject({
      kind: 'scale-legend',
      minLabel: 'Hydrophilic',
      maxLabel: 'Hydrophobic',
    })
    expect(legend('mapped-chain')).toEqual({
      kind: 'table-legend',
      table: [
        ['Mapped chain', MAPPED_CHAIN_COLOR],
        ['Other', OTHER_CHAIN_COLOR],
      ],
    })
  })
})
