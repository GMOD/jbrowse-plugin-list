import { layoutEngine } from '@jbrowse/bandage-core/layoutEngines'
import PluginManager from '@jbrowse/core/PluginManager'

import GraphComputeLayout from './GraphComputeLayout'

vi.mock('@jbrowse/bandage-core/layoutEngines', () => ({
  layoutEngine: vi.fn(() => Promise.resolve({ result: {}, duration: 0 })),
}))

// A layout the user moved on from while it waited behind another in the
// worker's queue
test('a layout aborted before it starts never reaches the engine', async () => {
  const method = new GraphComputeLayout(new PluginManager([]))
  const gone = new AbortController()
  gone.abort()
  await expect(
    method.execute({
      graph: { name: 'g', nodes: [], edges: [] },
      options: {},
      signal: gone.signal,
    } as never),
  ).rejects.toMatchObject({ name: 'AbortError' })
  expect(layoutEngine).not.toHaveBeenCalled()
})

// The abort the main thread posts after the call, which the worker's queue
// holds until the call has started
test('a layout aborted just after it is called never reaches the engine', async () => {
  const method = new GraphComputeLayout(new PluginManager([]))
  const superseded = new AbortController()
  const run = method.execute({
    graph: { nodes: [], edges: [] },
    options: {},
    sessionId: 'test',
    signal: superseded.signal,
  })
  superseded.abort()
  await expect(run).rejects.toMatchObject({ name: 'AbortError' })
  expect(layoutEngine).not.toHaveBeenCalled()
})
