import { types } from '@jbrowse/mobx-state-tree'
import { beforeEach, expect, test, vi } from 'vitest'

import { loadStructureData } from './loadStructureData'
import { makeStructureLoader } from './structureLoader'

import type { Entity } from './extractStructureSequences'
import type { StructureLoaderHost } from './structureLoader'

const entity = (seq: string): Entity => ({ entityId: '1', seq })

vi.mock('./loadStructureData', () => ({ loadStructureData: vi.fn() }))
const mockLoad = vi.mocked(loadStructureData)

// Minimal stand-ins matching only the surface makeStructureLoader touches, so
// the test exercises the loader's guard logic without molstar/structureModel.
const TestStructure = types
  .model('TestStructure', {})
  .volatile(() => ({
    loadedToMolstar: false,
    entities: undefined as Entity[] | undefined,
  }))
  .actions(self => ({
    setStructureData(d: { entities?: Entity[] }) {
      self.entities = d.entities
    },
    setLoadedToMolstar(v: boolean) {
      self.loadedToMolstar = v
    },
  }))

const TestHost = types
  .model('TestHost', { structures: types.array(TestStructure) })
  .volatile(() => ({
    molstarPluginContext: undefined as object | undefined,
    errors: [] as unknown[],
  }))
  .actions(self => ({
    setPlugin(p: object) {
      self.molstarPluginContext = p
    },
    setError(e: unknown) {
      self.errors.push(e)
    },
  }))

function setup(plugin: object) {
  const host = TestHost.create({ structures: [{}] })
  host.setPlugin(plugin)
  const load = makeStructureLoader(host as unknown as StructureLoaderHost)
  return { host, load, structure: host.structures[0]! }
}

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0))

beforeEach(() => {
  mockLoad.mockReset()
})

test('loads a pending structure and marks it loaded', async () => {
  mockLoad.mockResolvedValue({ entities: [entity('ABC')] })
  const { load, structure } = setup({})
  load()
  expect(mockLoad).toHaveBeenCalledTimes(1)
  await tick()
  expect(structure.loadedToMolstar).toBe(true)
  expect(structure.entities).toEqual([entity('ABC')])
})

test('does not start a second load while one is in flight', () => {
  mockLoad.mockReturnValue(new Promise(() => {}))
  const { load } = setup({})
  load()
  load()
  expect(mockLoad).toHaveBeenCalledTimes(1)
})

test('discards a stale-plugin result and reloads into the current plugin', async () => {
  const pluginA = { id: 'A' }
  const pluginB = { id: 'B' }
  let resolveFirst: (v: { entities?: Entity[] }) => void = () => {}
  mockLoad
    .mockImplementationOnce(() => new Promise(res => (resolveFirst = res)))
    .mockResolvedValueOnce({ entities: [entity('B')] })

  const { host, load, structure } = setup(pluginA)
  load() // starts loading into pluginA
  host.setPlugin(pluginB) // plugin swapped while loading
  resolveFirst({ entities: [entity('A')] }) // pluginA result arrives, now stale
  await tick()

  expect(structure.entities).toEqual([entity('B')])
  expect(structure.loadedToMolstar).toBe(true)
  expect(mockLoad).toHaveBeenCalledTimes(2)
})

test('reports load errors and leaves the structure unloaded', async () => {
  const err = new Error('boom')
  mockLoad.mockRejectedValue(err)
  const { host, load, structure } = setup({})
  load()
  await tick()
  expect(host.errors).toContain(err)
  expect(structure.loadedToMolstar).toBe(false)
})
