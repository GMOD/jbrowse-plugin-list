import PluginManager from '@jbrowse/core/PluginManager'
import LinearGenomeViewPlugin from '@jbrowse/plugin-linear-genome-view'
import VariantsPlugin from '@jbrowse/plugin-variants'
import { expect, test, vi } from 'vitest'

import GraphGenomeViewPlugin from '../index'
import { takesFormsMenu } from './formsMenu.ts'

import type DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'

// The host's own variant displays, not a fake: the mixin reads members of the
// multi-sample display by name, and a host that renames one drops the menu
// without an error.
function setup(plugins: { install: unknown }[]) {
  const pluginManager = new PluginManager([
    new LinearGenomeViewPlugin(),
    ...(plugins as never[]),
    new GraphGenomeViewPlugin(),
  ])
  pluginManager.createPluggableElements()
  pluginManager.configure()
  return pluginManager
}

test("the host's multi-sample variant display carries the forms menu", async () => {
  const pluginManager = setup([new VariantsPlugin()])
  const displays = (
    pluginManager.getElementTypesInGroup('display') as DisplayType[]
  ).filter(takesFormsMenu)
  await Promise.all(displays.map(d => d.loadStateModel()))
  const withRows = displays.flatMap(t => {
    const display = t.stateModel.create(
      {
        type: t.name,
        configuration: t.configSchema.create({ displayId: 'x', type: t.name }),
      },
      { pluginManager },
    )
    return 'sourcesBase' in display ? [{ name: t.name, display }] : []
  })
  expect(withRows.map(d => d.name)).not.toEqual([])
  for (const { display } of withRows) {
    for (const member of [
      'formsMenuItems',
      'setFormsPinned',
      'setSources',
      'trackMenuItems',
    ]) {
      expect(member in display).toBe(true)
    }
  }
})

test('a host with no variant display warns', () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  setup([])
  expect(warn).toHaveBeenCalledWith(
    expect.stringContaining('no linear VariantTrack display'),
  )
  warn.mockRestore()
})
