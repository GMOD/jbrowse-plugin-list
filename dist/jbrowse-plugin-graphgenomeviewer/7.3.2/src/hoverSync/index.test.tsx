import GraphHoverSyncF from './index'

import type PluginManager from '@jbrowse/core/PluginManager'

const POINT = 'LinearGenomeView-TracksContainerComponent'

// the two members the highlight actually reaches: the id it is matched by and
// the LGV's own projection
const lgv = () => ({ id: 'lgv1', getHighlightCoords: () => undefined })

// This point accumulates elements, so the registration goes through
// contributeToExtensionPoint, which appends. Registering through
// addToExtensionPoint would replace every other plugin's entries.
test('registers one contributed element on the accumulating point', () => {
  const calls: {
    name: string
    callback: (props: { model: unknown }) => unknown
  }[] = []
  const manager = {
    contributeToExtensionPoint: (
      name: string,
      callback: (props: { model: unknown }) => unknown,
    ) => {
      calls.push({ name, callback })
    },
    addToExtensionPoint: () => {
      throw new Error('an accumulating point is contributed to, not added to')
    },
  } as unknown as PluginManager
  GraphHoverSyncF(manager)

  expect(calls).toHaveLength(1)
  expect(calls[0]!.name).toBe(POINT)
  // one element, not an array: the fold and the key are the method's job
  expect(calls[0]!.callback({ model: lgv() })).toBeTruthy()
})
