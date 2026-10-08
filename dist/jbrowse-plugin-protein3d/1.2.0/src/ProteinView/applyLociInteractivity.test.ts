// @vitest-environment jsdom
import { expect, test } from 'vitest'

import { setMolstarLoci } from './applyLociInteractivity'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'
import { loadCaOnly } from '../test_data/molstarPlugin'

// Mol*'s Picking Level widens whatever it is handed. A user who set it to
// Chain in the Mol* controls saw one hovered codon, and one clicked residue's
// magenta, cover the whole chain.
test('a residue is marked as one residue whatever the picking level', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { structures } = await loadCaOnly(plugin, [
      { asym: 'A', entity: '1', residues: ['MET', 'LYS', 'ALA', 'GLY', 'SER'] },
    ])
    plugin.managers.interactivity.setProps({ granularity: 'chain' })
    await setMolstarLoci({
      interactivity: plugin.managers.interactivity,
      channel: 'select',
      targets: [{ structure: structures[0]!, entityId: '1', labelSeqIds: [2] }],
    })
    expect(plugin.managers.structure.selection.elementCount()).toBe(1)
  })
})
