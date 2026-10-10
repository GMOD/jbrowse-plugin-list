import PluginManager from '@jbrowse/core/PluginManager'
import { expect, test } from 'vitest'

import AddHighlightModelF from './index'

test('contributes one element to the TracksContainer extension point', () => {
  const pluginManager = new PluginManager()
  AddHighlightModelF(pluginManager)
  const callbacks =
    pluginManager.extensionPoints.get(
      'LinearGenomeView-TracksContainerComponent',
    ) ?? []
  expect(callbacks).toHaveLength(1)
  const elements = callbacks[0]?.([], { model: {} })
  expect(Array.isArray(elements) && elements.length).toBe(1)
})
