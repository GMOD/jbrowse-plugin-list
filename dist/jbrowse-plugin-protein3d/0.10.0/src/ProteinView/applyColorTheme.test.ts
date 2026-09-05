import { expect, test, vi } from 'vitest'

import { COLOR_SCHEME_VALUES, applyColorTheme } from './applyColorTheme'

import type { PluginContext } from 'molstar/lib/mol-plugin/context'

function makePlugin(structureComponents: unknown[]) {
  const updateRepresentationsTheme = vi.fn(() => Promise.resolve())
  const plugin = {
    managers: {
      structure: {
        hierarchy: {
          current: {
            structures: structureComponents.map(components => ({ components })),
          },
        },
        component: { updateRepresentationsTheme },
      },
    },
  }
  return {
    plugin: plugin as unknown as PluginContext,
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
  const { plugin, updateRepresentationsTheme } = makePlugin(['compA', 'compB'])
  await applyColorTheme({ plugin, colorScheme: 'plddt-confidence' })
  expect(updateRepresentationsTheme).toHaveBeenCalledTimes(2)
  expect(updateRepresentationsTheme).toHaveBeenNthCalledWith(1, 'compA', {
    color: 'plddt-confidence',
  })
  expect(updateRepresentationsTheme).toHaveBeenNthCalledWith(2, 'compB', {
    color: 'plddt-confidence',
  })
})

test('passes built-in theme names through unchanged', async () => {
  const { plugin, updateRepresentationsTheme } = makePlugin(['comp'])
  await applyColorTheme({ plugin, colorScheme: 'hydrophobicity' })
  expect(updateRepresentationsTheme).toHaveBeenCalledWith('comp', {
    color: 'hydrophobicity',
  })
})

test('no-op when no structures are loaded', async () => {
  const { plugin, updateRepresentationsTheme } = makePlugin([])
  await applyColorTheme({ plugin, colorScheme: 'default' })
  expect(updateRepresentationsTheme).not.toHaveBeenCalled()
})
