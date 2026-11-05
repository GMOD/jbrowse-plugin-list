// @vitest-environment jsdom
import { expect, test } from 'vitest'

import { loadStructureData } from './loadStructureData'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'

function atom(serial: number, resName: string, resSeq: number, b: number) {
  const x = (resSeq * 3.8).toFixed(3).padStart(8)
  return `ATOM  ${String(serial).padStart(5)}  CA  ${resName} A${String(resSeq).padStart(4)}    ${x}   0.000   0.000  1.00${b.toFixed(2).padStart(6)}           C`
}

const atoms = [
  atom(1, 'MET', 1, 20.5),
  atom(2, 'LYS', 2, 35.1),
  atom(3, 'ALA', 3, 61.75),
  'END',
].join('\n')

// Mol* leaves `exptl` empty when it converts a PDB file, so a crystal
// structure's B-factors used to be drawn as pLDDT.
test('a PDB file with an experimental EXPDTA record has no confidence', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { confidence, entities } = await loadStructureData({
      structure: { data: `EXPDTA    X-RAY DIFFRACTION\n${atoms}\n` },
      plugin,
    })
    expect(entities).toHaveLength(1)
    expect(confidence).toBeUndefined()
  })
})

test('a PDB file naming no method keeps its B-factors, as a prediction writes them', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    for (const header of ['', 'EXPDTA    THEORETICAL MODEL\n']) {
      const { confidence } = await loadStructureData({
        structure: { data: `${header}${atoms}\n` },
        plugin,
      })
      expect([...(confidence?.[0]?.byLabelSeqId.values() ?? [])]).toEqual([
        20.5, 35.1, 61.75,
      ])
    }
  })
})

test('a structure with neither data nor a url fails rather than loading as nothing', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    for (const structure of [{}, { data: '' }]) {
      await expect(loadStructureData({ structure, plugin })).rejects.toThrow(
        'a structure needs either data or a url',
      )
    }
  })
})
