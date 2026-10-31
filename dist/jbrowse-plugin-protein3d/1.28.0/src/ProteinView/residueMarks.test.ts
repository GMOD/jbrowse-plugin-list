// @vitest-environment jsdom
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { StateSelection } from 'molstar/lib/mol-state'
import { Color } from 'molstar/lib/mol-util/color'
import { expect, test } from 'vitest'

import { RESIDUE_MARKS_TAG, syncResidueMarks } from './residueMarks'
import { formatSite, parseSite } from './residueSpec'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'
import { loadPocket } from '../test_data/molstarPlugin'

test('a whole chain parses and formats as chain:*', () => {
  expect(parseSite('G:*')).toEqual({ kind: 'chain', chain: 'G' })
  expect(formatSite({ kind: 'chain', chain: 'G' })).toBe('G:*')
  expect(parseSite('G')).toEqual({ kind: 'component', compId: 'G' })
})

test('a cartoon mark of a chain draws that chain as a cartoon in its color', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { structure } = await loadPocket(plugin)
    await syncResidueMarks({
      plugin,
      structures: [structure],
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
