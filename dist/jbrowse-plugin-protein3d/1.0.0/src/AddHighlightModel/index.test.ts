import PluginManager from '@jbrowse/core/PluginManager'
import { expect, test } from 'vitest'

import AddHighlightModelF from './index'

test('contributes one element to the TracksContainer extension point', () => {
  const pluginManager = new PluginManager()
  AddHighlightModelF(pluginManager)
  const elements = pluginManager.evaluateExtensionPoint(
    'LinearGenomeView-TracksContainerComponent',
    [],
    { model: {} },
  )
  expect(Array.isArray(elements) && elements.length).toBe(1)
})
