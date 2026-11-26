// @vitest-environment jsdom
import { expect, test } from 'vitest'

import { loadCaOnly, loadPocket } from '../test_data/molstarPlugin'
import { drawnResidueIds } from './drawnResidueIds'
import loadMolstar from './loadMolstar'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'

import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

async function drawn(plugin: PluginContext, structures: Structure[]) {
  const byEntity = drawnResidueIds(plugin, await loadMolstar(), structures)
  return Object.fromEntries(
    [...byEntity].map(([entityId, ids]) => [
      entityId,
      [...ids].sort((a, b) => a - b),
    ]),
  )
}

const lys = (asym: string, entity: string) => ({
  asym,
  entity,
  residues: ['MET', 'LYS', 'ALA'],
})

test('a crystal draws its observed residues and its ligands', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { structures } = await loadPocket(plugin)
    expect(await drawn(plugin, structures)).toEqual({
      '1': [
        23, 24, 25, 26, 27, 30, 48, 72, 73, 74, 75, 76, 77, 82, 83, 86, 109,
        110, 113, 114, 117, 154, 155,
      ],
      '3': [0],
      '4': [0],
      '5': [0],
    })
  })
})

test("a spec's chains leave the other chains undrawn", async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { structures } = await loadCaOnly(
      plugin,
      [lys('A', '1'), lys('B', '2')],
      { drawChains: ['A'] },
    )
    expect(await drawn(plugin, structures)).toEqual({ '1': [1, 2, 3] })
  })
})

test('an assembly draws only its own chains', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { structures } = await loadCaOnly(
      plugin,
      [lys('A', '1'), lys('B', '2')],
      {
        assemblies: [
          { id: '1', asymIds: ['B'], oligomericDetails: 'monomeric' },
        ],
        assembly: '1',
      },
    )
    expect(await drawn(plugin, structures)).toEqual({ '2': [1, 2, 3] })
  })
})
