import { types } from '@jbrowse/mobx-state-tree'
import { beforeEach, expect, test, vi } from 'vitest'

import { loadStructureData } from './loadStructureData'
import { makeStructureLoader } from './structureLoader'

import type { Entity } from './extractStructureSequences'
import type { StructureData } from './loadStructureData'
import type { StructureLoaderHost } from './structureLoader'
import type { Structure } from 'molstar/lib/mol-model/structure'

const entity = (seq: string): Entity => ({
  entityId: '1',
  seq,
  seqIds: Array.from(seq, (_, i) => i + 1),
})
// stand-in for a molstar Structure — the loader only passes the handle through
const molstarStructure = (id: string) => ({ id }) as unknown as Structure

vi.mock('./loadStructureData', () => ({ loadStructureData: vi.fn() }))
const mockLoad = vi.mocked(loadStructureData)

// Minimal stand-ins matching only the surface makeStructureLoader touches, so
// the test exercises the loader's guard logic without molstar/structureModel.
const TestStructure = types
  .model('TestStructure', {})
  .volatile(() => ({
    loadedToMolstar: false,
    entities: undefined as Entity[] | undefined,
    molstarStructure: undefined as Structure | undefined,
  }))
  .actions(self => ({
    setStructureData(d: StructureData) {
      self.entities = d.entities
      self.molstarStructure = d.molstarStructure
    },
    setLoadedToMolstar(v: boolean) {
      self.loadedToMolstar = v
      if (!v) {
        self.molstarStructure = undefined
      }
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

function setup(plugin: object, count = 1) {
  const host = TestHost.create({
    structures: Array.from({ length: count }, () => ({})),
  })
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

// Regression: molstarStructure used to be hierarchy.current.structures[myIndex],
// but molstar orders that array by load completion while the index came from the
// model's own array — so with two structures in flight the slower-loading model
// bound to the other one's geometry, and its highlights landed on the wrong
// structure. The handle now comes back from the load that created it.
test('each structure keeps the handle its own load returned, whatever the order', async () => {
  const first = molstarStructure('first')
  const second = molstarStructure('second')
  let resolveFirst: (v: StructureData) => void = () => {}
  mockLoad
    .mockImplementationOnce(() => new Promise(res => (resolveFirst = res)))
    .mockResolvedValueOnce({ molstarStructure: second })

  const { host, load } = setup({}, 2)
  load()
  expect(mockLoad).toHaveBeenCalledTimes(2)

  // structures[1] finishes first — the array position no longer matches
  await tick()
  expect(host.structures[1]!.molstarStructure).toBe(second)
  expect(host.structures[0]!.molstarStructure).toBeUndefined()

  resolveFirst({ molstarStructure: first })
  await tick()
  expect(host.structures[0]!.molstarStructure).toBe(first)
  expect(host.structures[1]!.molstarStructure).toBe(second)
})

test('unloading drops the handle so highlights never target a dead plugin', async () => {
  mockLoad.mockResolvedValue({ molstarStructure: molstarStructure('a') })
  const { load, structure } = setup({})
  load()
  await tick()
  expect(structure.molstarStructure).toBeDefined()

  structure.setLoadedToMolstar(false)
  expect(structure.molstarStructure).toBeUndefined()
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
