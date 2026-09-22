import { autorun, observable, runInAction } from 'mobx'
import { expect, test, vi } from 'vitest'

import { makeLociChannel } from './lociChannel'
import { parseStructure } from '../test_data/molstarStructure'

import type { LociMarks } from './applyLociInteractivity'
import type {
  Structure,
  StructureElement,
} from 'molstar/lib/mol-model/structure'

vi.mock('./loadMolstar', async () => {
  const { StructureSelection } = await import('molstar/lib/mol-model/structure')
  const { Script } = await import('molstar/lib/mol-script/script')
  return { default: async () => ({ Script, StructureSelection }) }
})

// what the plugin was left lighting, as the structures the loci belong to
function recordingPlugin() {
  const lit: Structure[] = []
  const mark = ({ loci }: { loci: StructureElement.Loci }) => {
    lit.push(loci.structure)
  }
  const interactivity: LociMarks = {
    lociSelects: {
      deselectAll: () => {
        lit.length = 0
      },
      select: mark,
    },
    lociHighlights: {
      clearHighlights: () => {
        lit.length = 0
      },
      highlight: mark,
    },
  }
  return { plugin: { managers: { interactivity } }, lit }
}

async function structure(selectLabelSeqIds: number[] = []) {
  const molstarStructure = await parseStructure([
    { asym: 'A', entity: '1', residues: ['MET', 'LYS', 'ALA'] },
  ])
  const hoverLabelSeqIds: number[] = []
  return observable({
    molstarStructures: [molstarStructure],
    mappedEntity: { entityId: '1' },
    selectLabelSeqIds,
    hoverLabelSeqIds,
  })
}

// A TP53 session opened on R248 with a mouse model superposed: the second
// structure selects nothing, and used to deselect the first's R248 as it
// loaded.
test('a structure selecting nothing leaves another structure selection lit', async () => {
  const { plugin, lit } = recordingPlugin()
  const human = await structure([2])
  const mouse = await structure()
  const host = observable({ molstarPluginContext: plugin, structures: [human] })
  const dispose = autorun(makeLociChannel(host, 'select'))
  await vi.waitFor(() => {
    expect(lit).toHaveLength(1)
  })
  expect(lit[0]).toBe(human.molstarStructures[0])

  runInAction(() => {
    host.structures.push(mouse)
  })
  await new Promise(r => setTimeout(r, 0))
  expect(lit).toHaveLength(1)
  expect(lit[0]).toBe(human.molstarStructures[0])

  runInAction(() => {
    human.selectLabelSeqIds = []
  })
  await vi.waitFor(() => {
    expect(lit).toEqual([])
  })
  dispose()
})

test('when updates overlap, the later one is what stays lit', async () => {
  const { plugin, lit } = recordingPlugin()
  const human = await structure([1])
  const mouse = await structure()
  const host = observable({
    molstarPluginContext: plugin,
    structures: [human, mouse],
  })
  const dispose = autorun(makeLociChannel(host, 'select'))
  runInAction(() => {
    human.selectLabelSeqIds = []
    mouse.selectLabelSeqIds = [2]
  })
  await new Promise(r => setTimeout(r, 0))
  expect(lit).toHaveLength(1)
  expect(lit[0]).toBe(mouse.molstarStructures[0])
  dispose()
})
