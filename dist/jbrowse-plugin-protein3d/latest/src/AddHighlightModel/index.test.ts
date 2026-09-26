import PluginManager from '@jbrowse/core/PluginManager'
import { expect, test } from 'vitest'

import AddHighlightModelF from './index'

// v4.0.0 and v4.3.0 seed this point with undefined, and only grid-bookmark's
// callback turns that into an array, which the embedded linear genome view
// does not load.
test('contributes to a TracksContainer extension point seeded with undefined', () => {
  const pluginManager = new PluginManager()
  AddHighlightModelF(pluginManager)
  const elements = pluginManager.evaluateExtensionPoint(
    'LinearGenomeView-TracksContainerComponent',
    undefined,
    { model: {} },
  )
  expect(Array.isArray(elements) && elements.length).toBe(1)
})
