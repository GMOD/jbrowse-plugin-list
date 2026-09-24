import { autorun, observable, runInAction } from 'mobx'
import { expect, test, vi } from 'vitest'

import { frameResidues, makeSelectionFramer } from './frameSelection'
import { parseStructure } from '../test_data/molstarStructure'

import type { Loci } from 'molstar/lib/mol-model/loci'

vi.mock('./loadMolstar', async () => {
  const { StructureSelection } = await import('molstar/lib/mol-model/structure')
  const { Script } = await import('molstar/lib/mol-script/script')
  return { default: async () => ({ Script, StructureSelection }) }
})

function recordingPlugin() {
  const focused: Loci[][] = []
  const sticks: Loci[] = []
  return {
    focused,
    sticks,
    plugin: {
      managers: {
        camera: {
          focusLoci: (loci: Loci[]) => {
            focused.push(loci)
          },
        },
        structure: {
          focus: {
            setFromLoci: (loci: Loci) => {
              sticks.push(loci)
            },
          },
        },
      },
    },
  }
}

async function structure(seeded: boolean, clickedLabelSeqIds: number[] = []) {
  const molstarStructure = await parseStructure([
    { asym: 'A', entity: '1', residues: ['MET', 'LYS', 'ALA'] },
  ])
  return observable({
    loading: true,
    seedLit: seeded,
    molstarStructure,
    mappedEntity: { entityId: '1' },
    clickedLabelSeqIds,
  })
}

const tick = () => new Promise(r => setTimeout(r, 0))

test('frames a seeded selection once every structure has settled and superposed', async () => {
  const { plugin, focused } = recordingPlugin()
  const human = await structure(true, [2])
  const mouse = await structure(false)
  const host = observable({
    molstarPluginContext: plugin,
    structures: [human, mouse],
    superposedCount: 0,
  })
  const dispose = autorun(makeSelectionFramer(host))

  runInAction(() => {
    human.loading = false
    mouse.loading = false
  })
  await tick()
  expect(focused).toHaveLength(0)

  runInAction(() => {
    host.superposedCount = 2
  })
  await vi.waitFor(() => {
    expect(focused).toHaveLength(1)
  })
  expect(focused[0]).toHaveLength(1)

  // a later click does not move the camera again
  runInAction(() => {
    human.clickedLabelSeqIds = [1]
  })
  await tick()
  expect(focused).toHaveLength(1)
  dispose()
})

// on a PDB entry the SIFTS answer both settles the structure and lets the
// transcript-residue seed resolve, and the framer can run between the two
test('a seed that resolves after the structure settles is still framed', async () => {
  const { plugin, focused } = recordingPlugin()
  const only = await structure(true)
  const host = observable({
    molstarPluginContext: plugin,
    structures: [only],
    superposedCount: 0,
  })
  const dispose = autorun(makeSelectionFramer(host))
  runInAction(() => {
    only.loading = false
  })
  await tick()
  expect(focused).toHaveLength(0)
  runInAction(() => {
    only.clickedLabelSeqIds = [2]
  })
  await vi.waitFor(() => {
    expect(focused).toHaveLength(1)
  })
  dispose()
})

test('a clicked selection with no seed leaves the camera alone', async () => {
  const { plugin, focused } = recordingPlugin()
  const only = await structure(false, [2])
  const host = observable({
    molstarPluginContext: plugin,
    structures: [only],
    superposedCount: 0,
  })
  const dispose = autorun(makeSelectionFramer(host))
  runInAction(() => {
    only.loading = false
  })
  await tick()
  expect(focused).toHaveLength(0)
  dispose()
})

test('a remount frames again in the new plugin', async () => {
  const first = recordingPlugin()
  const second = recordingPlugin()
  const only = await structure(true, [2])
  const host = observable({
    molstarPluginContext: first.plugin,
    structures: [only],
    superposedCount: 0,
  })
  const dispose = autorun(makeSelectionFramer(host))
  runInAction(() => {
    only.loading = false
  })
  await vi.waitFor(() => {
    expect(first.focused).toHaveLength(1)
  })
  runInAction(() => {
    host.molstarPluginContext = second.plugin
  })
  await vi.waitFor(() => {
    expect(second.focused).toHaveLength(1)
  })
  expect(first.focused).toHaveLength(1)
  dispose()
})

test('a one-residue seed is focused like a click on it', async () => {
  const { plugin, focused, sticks } = recordingPlugin()
  const only = await structure(true, [2])
  const host = observable({
    molstarPluginContext: plugin,
    structures: [only],
    superposedCount: 0,
  })
  const dispose = autorun(makeSelectionFramer(host))
  runInAction(() => {
    only.loading = false
  })
  await vi.waitFor(() => {
    expect(focused).toHaveLength(1)
  })
  expect(sticks).toEqual(focused[0])
  dispose()
})

test('a seeded range is framed but not focused', async () => {
  const { plugin, focused, sticks } = recordingPlugin()
  const only = await structure(true, [1, 2, 3])
  const host = observable({
    molstarPluginContext: plugin,
    structures: [only],
    superposedCount: 0,
  })
  const dispose = autorun(makeSelectionFramer(host))
  runInAction(() => {
    only.loading = false
  })
  await vi.waitFor(() => {
    expect(focused).toHaveLength(1)
  })
  expect(sticks).toHaveLength(0)
  dispose()
})

test('frameResidues frames its targets, unless the plugin moved on meanwhile', async () => {
  const { plugin, focused } = recordingPlugin()
  const { molstarStructure } = await structure(false)
  const target = {
    structure: molstarStructure,
    entityId: '1',
    labelSeqIds: [2],
  }
  await frameResidues(plugin, [target], () => false)
  expect(focused).toHaveLength(0)
  await frameResidues(plugin, [target])
  expect(focused).toHaveLength(1)
})
