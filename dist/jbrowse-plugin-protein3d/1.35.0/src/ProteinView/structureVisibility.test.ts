// @vitest-environment jsdom
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { StateSelection } from 'molstar/lib/mol-state'
import { expect, test } from 'vitest'

import loadMolstar from './loadMolstar'
import { structureRootCell } from './structureCells'
import { setStructuresHidden } from './structureVisibility'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'
import { loadCaOnly } from '../test_data/molstarPlugin'

// with Mol*'s controls shown, a user can hide one representation by its eye
test('a shown structure keeps a representation the user hid in Mol*', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const [structure] = (
      await loadCaOnly(plugin, [
        { asym: 'A', entity: '1', residues: Array(12).fill('ALA') },
      ])
    ).structures
    if (!structure) {
      throw new Error('no structure loaded')
    }
    const molstar = await loadMolstar()
    const root = structureRootCell(plugin, molstar, structure)!
    const [representation] = plugin.state.data.select(
      StateSelection.Generators.ofTransformer(
        StateTransforms.Representation.StructureRepresentation3D,
        root.transform.ref,
      ),
    )
    const ref = representation!.transform.ref
    molstar.setSubtreeVisibility(plugin.state.data, ref, true)
    await setStructuresHidden({
      plugin,
      structures: [structure],
      hidden: false,
    })
    expect(plugin.state.data.cells.get(ref)?.state.isHidden).toBe(true)
  })
})
