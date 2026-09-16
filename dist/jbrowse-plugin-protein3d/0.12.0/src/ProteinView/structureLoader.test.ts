import { types } from '@jbrowse/mobx-state-tree'
import { getAlphaFoldStructureUrl } from 'p2s_mapper'
import { beforeEach, expect, test, vi } from 'vitest'

import { loadStructureData } from './loadStructureData'
import { makeStructureLoader } from './structureLoader'

import type { StructureData } from './loadStructureData'
import type {
  AlphaFoldModelFetcher,
  StructureLoaderHost,
} from './structureLoader'
import type { Instance } from '@jbrowse/mobx-state-tree'
import type { Structure } from 'molstar/lib/mol-model/structure'
import type { Entity } from 'p2s_mapper'

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
  .model('TestStructure', {
    url: types.maybe(types.string),
    data: types.maybe(types.string),
    uniprotId: types.maybe(types.string),
    userProvidedTranscriptSequence: types.optional(types.string, ''),
  })
  .volatile(() => ({
    loadedToMolstar: false,
    entities: undefined as Entity[] | undefined,
    molstarStructure: undefined as Structure | undefined,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    error: undefined as unknown,
  }))
  .actions(self => ({
    setUrl(url: string) {
      self.url = url
    },
    setError(e: unknown) {
      self.error = e
    },
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
  }))
  .actions(self => ({
    setPlugin(p: object) {
      self.molstarPluginContext = p
    },
    removeFirstStructure() {
      self.structures.remove(self.structures[0]!)
    },
  }))

type TestHostInstance = Instance<typeof TestHost>

// One cast, at the seam where the stand-in stands in for the real host
const asLoaderHost = (host: TestHostInstance) =>
  host as unknown as StructureLoaderHost

function setup(plugin: object, count = 1) {
  const host = TestHost.create({
    structures: Array.from({ length: count }, () => ({})),
  })
  host.setPlugin(plugin)
  const load = makeStructureLoader(asLoaderHost(host))
  return { host, load, structure: host.structures[0]! }
}

function setupAlphaFold(
  snapshot: { uniprotId?: string; url?: string; transcript?: string },
  fetchModels: AlphaFoldModelFetcher,
) {
  const host = TestHost.create({
    structures: [
      {
        uniprotId: snapshot.uniprotId,
        url: snapshot.url,
        userProvidedTranscriptSequence: snapshot.transcript ?? '',
      },
    ],
  })
  host.setPlugin({})
  return {
    load: makeStructureLoader(asLoaderHost(host), fetchModels),
    structure: host.structures[0]!,
  }
}

// A Mol* stand-in that records what a load's clean-up removed from it
function recordingPlugin() {
  const removed: unknown[] = []
  return {
    removed,
    plugin: {
      managers: {
        structure: {
          hierarchy: {
            findStructure: (structure: unknown) =>
              structure === undefined
                ? undefined
                : { kind: 'structure', model: { trajectory: structure } },
            remove: (refs: unknown[]) => {
              removed.push(...refs)
              return undefined
            },
          },
        },
      },
    },
  }
}

const alphaFoldModel = (accession: string, sequence: string) => ({
  accession,
  url: `https://alphafold.ebi.ac.uk/files/AF-${accession}-F1-model_v6.cif`,
  sequence,
})

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

test('reports a load error on the structure that failed, not the view', async () => {
  const err = new Error('boom')
  // the handler logs as well as reporting, so expect the log rather than let
  // it print: an unexpected console.error in this suite is worth noticing
  const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
  mockLoad.mockRejectedValue(err)
  const { load, structure } = setup({})
  load()
  await tick()
  expect(structure.error).toBe(err)
  expect(structure.loadedToMolstar).toBe(false)
  expect(logged).toHaveBeenCalledWith(err)
  logged.mockRestore()
})

test('a load that fails because its plugin was swapped away retries into the current one', async () => {
  const pluginA = { id: 'A' }
  const pluginB = { id: 'B' }
  let rejectFirst: (e: unknown) => void = () => {}
  mockLoad
    .mockImplementationOnce(() => new Promise((_, rej) => (rejectFirst = rej)))
    .mockResolvedValueOnce({ entities: [entity('B')] })

  const { host, load, structure } = setup(pluginA)
  load()
  host.setPlugin(pluginB)
  rejectFirst(new Error('plugin disposed'))
  await tick()

  expect(structure.error).toBeUndefined()
  expect(structure.loadedToMolstar).toBe(true)
  expect(structure.entities).toEqual([entity('B')])
  expect(mockLoad).toHaveBeenCalledTimes(2)
})

// A `{ uniprotId }` structure has no file until AlphaFold DB names one: the
// spelled AF-<acc>-F1-model_v6 404s for anything folded in fragments, and the
// version moves under every config already published.
test('a uniprotId structure opens the model AlphaFold DB names for the transcript', async () => {
  mockLoad.mockResolvedValue({})
  const fetchModels = vi.fn(() =>
    Promise.resolve([
      alphaFoldModel('P04637', 'MEEPQSDP'),
      alphaFoldModel('P04637-2', 'MEEPQ'),
    ]),
  )
  const { load, structure } = setupAlphaFold(
    { uniprotId: 'P04637', transcript: 'MEEPQ*' },
    fetchModels,
  )
  load()
  await tick()
  expect(fetchModels).toHaveBeenCalledWith('P04637')
  expect(structure.url).toBe(alphaFoldModel('P04637-2', '').url)
  expect(mockLoad).toHaveBeenCalledTimes(1)
})

test('with no transcript match the canonical model wins over an isoform', async () => {
  mockLoad.mockResolvedValue({})
  const { load, structure } = setupAlphaFold({ uniprotId: 'P04637' }, () =>
    Promise.resolve([
      alphaFoldModel('P04637-2', 'MEEPQ'),
      alphaFoldModel('P04637', 'MEEPQSDP'),
    ]),
  )
  load()
  await tick()
  expect(structure.url).toBe(alphaFoldModel('P04637', '').url)
})

// An unreachable API has said nothing about the accession, so the spelled
// filename is still worth trying.
test('a failed prediction API falls back to the canonical filename', async () => {
  mockLoad.mockResolvedValue({})
  const { load, structure } = setupAlphaFold({ uniprotId: 'P04637' }, () =>
    Promise.reject(new Error('HTTP 503')),
  )
  load()
  await tick()
  expect(structure.url).toBe(getAlphaFoldStructureUrl('P04637'))
  expect(structure.loadedToMolstar).toBe(true)
})

// An API that answers with no models has: spelling a filename anyway turns
// "AlphaFold has not folded this protein" into a 404 to diagnose.
test('an accession AlphaFold has no model for is reported, not guessed at', async () => {
  const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
  mockLoad.mockResolvedValue({})
  const { load, structure } = setupAlphaFold({ uniprotId: 'P99999' }, () =>
    Promise.resolve([]),
  )
  load()
  await tick()
  expect(structure.url).toBeUndefined()
  expect(structure.loadedToMolstar).toBe(false)
  expect(structure.error).toEqual(
    new Error('AlphaFold DB has no model for P99999'),
  )
  expect(mockLoad).not.toHaveBeenCalled()
  logged.mockRestore()
})

test('a structure that already has a url never asks AlphaFold DB', async () => {
  mockLoad.mockResolvedValue({})
  const fetchModels = vi.fn(() => Promise.resolve([]))
  const { load, structure } = setupAlphaFold(
    { uniprotId: 'P04637', url: 'https://e.com/mine.cif' },
    fetchModels,
  )
  load()
  await tick()
  expect(fetchModels).not.toHaveBeenCalled()
  expect(structure.url).toBe('https://e.com/mine.cif')
})

// A structure removed while its file was still downloading has no
// molstarStructure for removeStructure to take out, and the load that lands
// afterwards still puts a trajectory in Mol*. Left there it stays on the canvas
// and joins the next superposition as a structure the view does not know about.
test('a structure removed mid-load takes its trajectory out of Mol* when it lands', async () => {
  const structureHandle = molstarStructure('ghost')
  let resolveLoad: (v: StructureData) => void = () => {}
  mockLoad.mockImplementationOnce(() => new Promise(res => (resolveLoad = res)))
  const { removed, plugin } = recordingPlugin()

  const host = TestHost.create({ structures: [{ url: 'a.cif' }] })
  host.setPlugin(plugin)
  const load = makeStructureLoader(asLoaderHost(host))
  load()

  host.removeFirstStructure()
  resolveLoad({ molstarStructure: structureHandle })
  await tick()

  expect(removed).toEqual([structureHandle])
})

// A remount retries the load from the start, so the last attempt's failure is
// stale — and while it sat there `loading` read the structure as settled, so a
// wait on the view finished in the middle of the retry.
test('a retry clears the failure it is retrying', async () => {
  const logged = vi.spyOn(console, 'error').mockImplementation(() => {})
  let settleSecond: (v: StructureData) => void = () => {}
  mockLoad
    .mockRejectedValueOnce(new Error('boom'))
    .mockImplementationOnce(() => new Promise(res => (settleSecond = res)))

  const { host, load, structure } = setup({ id: 'A' })
  load()
  await tick()
  expect(structure.error).toEqual(new Error('boom'))

  host.setPlugin({ id: 'B' })
  load()
  expect(structure.error).toBeUndefined()

  settleSecond({})
  await tick()
  expect(structure.loadedToMolstar).toBe(true)
  logged.mockRestore()
})
