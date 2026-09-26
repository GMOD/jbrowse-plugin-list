import { types } from '@jbrowse/mobx-state-tree'
import { beforeEach, expect, test, vi } from 'vitest'

import { makeStructureSuperposer } from './structureSuperposer'
import { superposeStructures } from './superposeStructures'
import { parseStructure } from '../test_data/molstarStructure'

import type { StructureSuperposerHost } from './structureSuperposer'
import type { Structure } from 'molstar/lib/mol-model/structure'

vi.mock('./superposeStructures', () => ({ superposeStructures: vi.fn() }))
const mockSuperpose = vi.mocked(superposeStructures)

// Minimal stand-ins matching only the surface makeStructureSuperposer touches.
const TestStructure = types
  .model('TestStructure', {})
  .volatile(() => ({
    loadedToMolstar: false,
    molstarStructures: new Array<Structure>(),
  }))
  .actions(self => ({
    setLoadedToMolstar(v: boolean, molstarStructures: Structure[] = []) {
      self.loadedToMolstar = v
      self.molstarStructures = molstarStructures
    },
  }))

const TestHost = types
  .model('TestHost', { structures: types.array(TestStructure) })
  .volatile(() => ({
    molstarPluginContext: undefined as object | undefined,
    superposedCount: 0,
    errors: [] as unknown[],
  }))
  .actions(self => ({
    setPlugin(p?: object) {
      self.molstarPluginContext = p
    },
    setSuperposedCount(n: number) {
      self.superposedCount = n
    },
    setError(e: unknown) {
      self.errors.push(e)
    },
  }))

function setup(plugin: object, loadedCount: number) {
  const host = TestHost.create({ structures: [{}, {}, {}] })
  host.setPlugin(plugin)
  for (let i = 0; i < loadedCount; i++) {
    host.structures[i]!.setLoadedToMolstar(true)
  }
  const run = makeStructureSuperposer(
    host as unknown as StructureSuperposerHost,
  )
  return { host, run }
}

const chain = { asym: 'A', entity: '1', residues: ['MET', 'LYS', 'ALA'] }

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0))

beforeEach(() => {
  mockSuperpose.mockReset()
  mockSuperpose.mockResolvedValue(undefined)
})

test('superposes once two structures are loaded', () => {
  const { run } = setup({}, 2)
  run()
  expect(mockSuperpose).toHaveBeenCalledTimes(1)
})

test('does not superpose with fewer than two loaded', () => {
  const { run } = setup({}, 1)
  run()
  expect(mockSuperpose).not.toHaveBeenCalled()
})

test('does not re-superpose when the loaded count is unchanged', async () => {
  const { run } = setup({}, 2)
  run()
  await tick()
  run()
  expect(mockSuperpose).toHaveBeenCalledTimes(1)
})

test('re-superposes when another structure loads', async () => {
  const { host, run } = setup({}, 2)
  run()
  await tick()
  host.structures[2]!.setLoadedToMolstar(true)
  run()
  expect(mockSuperpose).toHaveBeenCalledTimes(2)
})

test('does not start a second run while one is in flight', () => {
  mockSuperpose.mockReturnValue(new Promise(() => {}))
  const { host, run } = setup({}, 2)
  run()
  host.structures[2]!.setLoadedToMolstar(true)
  run()
  expect(mockSuperpose).toHaveBeenCalledTimes(1)
})

test('re-superposes after the plugin is swapped', async () => {
  const { host, run } = setup({ id: 'A' }, 2)
  run()
  await tick()
  host.setPlugin({ id: 'B' })
  run()
  expect(mockSuperpose).toHaveBeenCalledTimes(2)
})

test('reports superposition errors', async () => {
  const err = new Error('boom')
  const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
  mockSuperpose.mockRejectedValue(err)
  const { host, run } = setup({}, 2)
  run()
  await tick()
  expect(host.errors).toContain(err)
  expect(logged).toHaveBeenCalledWith(err)
  logged.mockRestore()
})

// The view's structures, each with every model of its load, in view order: the
// first is the pivot. Reading Mol*'s own list instead aligned each model of an
// NMR ensemble on its own.
test('superposes the loaded structures of the view, each with all its models', async () => {
  const [model1, model2, single] = await Promise.all([
    parseStructure([chain]),
    parseStructure([chain]),
    parseStructure([chain]),
  ])
  const host = TestHost.create({ structures: [{}, {}, {}] })
  host.setPlugin({})
  host.structures[0]!.setLoadedToMolstar(true, [model1, model2])
  host.structures[2]!.setLoadedToMolstar(true, [single])
  makeStructureSuperposer(host as unknown as StructureSuperposerHost)()
  expect(mockSuperpose).toHaveBeenCalledWith({}, [[model1, model2], [single]])
})
