// @vitest-environment jsdom
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { StateSelection } from 'molstar/lib/mol-state'
import { Color } from 'molstar/lib/mol-util/color'
import { expect, test } from 'vitest'

import { loadCaOnly, loadPocket } from '../test_data/molstarPlugin'
import {
  RESIDUE_MARKS_TAG,
  syncResidueMarks,
  unmatchedMarkNotices,
} from './residueMarks'
import { parseSite } from './residueSpec'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'

test('a whole chain parses as chain:*', () => {
  expect(parseSite('G:*')).toEqual({ kind: 'chain', chain: 'G' })
  expect(parseSite('G')).toEqual({ kind: 'component', compId: 'G' })
})

test('a cartoon mark of a chain draws that chain as a cartoon in its color', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { structure } = await loadPocket(plugin)
    await syncResidueMarks({
      plugin,
      structures: [[structure]],
      marks: [
        {
          site: 'A:*',
          mark: 'cartoon',
          encoding: { color: { value: '#2a9d8f' } },
        },
      ],
    })
    const [representation] = plugin.state.data.select(
      StateSelection.Generators.root
        .subtree()
        .withTag(RESIDUE_MARKS_TAG)
        .withTransformer(
          StateTransforms.Representation.StructureRepresentation3D,
        ),
    )
    const params = representation?.transform.params
    expect(params?.type.name).toBe('cartoon')
    expect(params?.colorTheme.params.value).toBe(Color.fromHexStyle('#2a9d8f'))
    expect(representation?.obj?.data.repr.renderObjects.length).toBeGreaterThan(
      0,
    )
  })
})

test('a mark whose site selects nothing is reported, one still loading is not', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { structure } = await loadPocket(plugin)
    const unmatched = await syncResidueMarks({
      plugin,
      structures: [[structure], undefined],
      marks: [
        { site: 'A:12', mark: 'sticks' },
        { site: 'A:999', mark: 'spheres' },
        { site: 'Z:*', mark: 'none', label: 'gone' },
        { site: 'A:999', structure: 1 },
      ],
      labels: false,
    })
    expect(unmatchedMarkNotices(unmatched, 2)).toEqual([
      'mark A:999 is not in structures[0]',
      'mark Z:* is not in structures[0]',
    ])
    expect(unmatchedMarkNotices(unmatched, 1)).toEqual([
      'mark A:999 is not in the structure',
      'mark Z:* is not in the structure',
    ])
  })
})

test('a mark draws on every model of an NMR ensemble', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { structures } = await loadCaOnly(
      plugin,
      [{ asym: 'A', entity: '1', residues: ['MET', 'LYS', 'ALA'] }],
      { models: 3 },
    )
    await syncResidueMarks({
      plugin,
      structures: [structures],
      marks: [{ site: 'A:2', mark: 'spheres' }],
      labels: false,
    })
    const drawnOn = plugin.state.data
      .select(
        StateSelection.Generators.root
          .subtree()
          .withTag(RESIDUE_MARKS_TAG)
          .withTransformer(
            StateTransforms.Representation.StructureRepresentation3D,
          ),
      )
      .map(cell => cell.obj?.data.sourceData.model.id)
    expect(structures).toHaveLength(3)
    expect(drawnOn).toEqual(structures.map(s => s.model.id))
  })
})

test('a label with mark none draws no geometry of its own', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { structure } = await loadPocket(plugin)
    await syncResidueMarks({
      plugin,
      structures: [[structure]],
      marks: [{ site: 'A:*', mark: 'none', label: 'VHL' }],
      labels: false,
    })
    expect(
      plugin.state.data.select(
        StateSelection.Generators.root
          .subtree()
          .withTag(RESIDUE_MARKS_TAG)
          .withTransformer(
            StateTransforms.Representation.StructureRepresentation3D,
          ),
      ),
    ).toEqual([])
  })
})
