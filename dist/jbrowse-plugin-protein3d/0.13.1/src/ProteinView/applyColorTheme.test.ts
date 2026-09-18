import { expect, test, vi } from 'vitest'

import { COLOR_SCHEME_VALUES, applyColorTheme } from './applyColorTheme'

import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

function makePlugin(structureComponents: string[]) {
  const updateRepresentationsTheme = vi.fn(() => Promise.resolve())
  const loaded = structureComponents.map(components => ({
    molstarStructure: {} as Structure,
    components,
  }))
  const plugin = {
    managers: {
      structure: {
        hierarchy: {
          findStructure: (structure: Structure) =>
            loaded.find(l => l.molstarStructure === structure),
        },
        component: { updateRepresentationsTheme },
      },
    },
  }
  return {
    plugin: plugin as unknown as PluginContext,
    structures: loaded.map(l => ({ molstarStructure: l.molstarStructure })),
    updateRepresentationsTheme,
  }
}

test('exposes pLDDT among the color schemes', () => {
  expect(COLOR_SCHEME_VALUES).toContain('plddt-confidence')
  expect(COLOR_SCHEME_VALUES).toContain('default')
  // scheme values are unique (no duplicate menu entries)
  expect(new Set(COLOR_SCHEME_VALUES).size).toBe(COLOR_SCHEME_VALUES.length)
})

test('applies the chosen theme to every loaded structure', async () => {
  const { plugin, structures, updateRepresentationsTheme } = makePlugin([
    'compA',
    'compB',
  ])
  await applyColorTheme({
    plugin,
    colorScheme: 'plddt-confidence',
    structures,
  })
  expect(updateRepresentationsTheme).toHaveBeenCalledTimes(2)
  expect(updateRepresentationsTheme).toHaveBeenNthCalledWith(1, 'compA', {
    color: 'plddt-confidence',
  })
  expect(updateRepresentationsTheme).toHaveBeenNthCalledWith(2, 'compB', {
    color: 'plddt-confidence',
  })
})

test('passes built-in theme names through unchanged', async () => {
  const { plugin, structures, updateRepresentationsTheme } = makePlugin([
    'comp',
  ])
  await applyColorTheme({ plugin, colorScheme: 'hydrophobicity', structures })
  expect(updateRepresentationsTheme).toHaveBeenCalledWith('comp', {
    color: 'hydrophobicity',
  })
})

test("colors each structure's own mapped chain", async () => {
  const { plugin, structures, updateRepresentationsTheme } = makePlugin([
    'compA',
    'compB',
  ])
  await applyColorTheme({
    plugin,
    colorScheme: 'mapped-chain',
    structures: [
      { ...structures[0]!, entityId: '1' },
      { ...structures[1]!, entityId: '3' },
    ],
  })
  expect(updateRepresentationsTheme).toHaveBeenNthCalledWith(1, 'compA', {
    color: 'mapped-chain',
    colorParams: { entityId: '1' },
  })
  expect(updateRepresentationsTheme).toHaveBeenNthCalledWith(2, 'compB', {
    color: 'mapped-chain',
    colorParams: { entityId: '3' },
  })
})

test('skips a structure molstar no longer holds', async () => {
  const { plugin, updateRepresentationsTheme } = makePlugin(['comp'])
  await applyColorTheme({
    plugin,
    colorScheme: 'default',
    structures: [{ molstarStructure: {} as Structure }],
  })
  expect(updateRepresentationsTheme).not.toHaveBeenCalled()
})

test('no-op when no structures are loaded', async () => {
  const { plugin, structures, updateRepresentationsTheme } = makePlugin([])
  await applyColorTheme({ plugin, colorScheme: 'default', structures })
  expect(updateRepresentationsTheme).not.toHaveBeenCalled()
})
