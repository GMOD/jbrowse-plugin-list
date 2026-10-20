// @vitest-environment jsdom
import {
  StructureElement,
  StructureProperties as SP,
} from 'molstar/lib/mol-model/structure'
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { StateSelection } from 'molstar/lib/mol-state'
import { Color } from 'molstar/lib/mol-util/color'
import { expect, test } from 'vitest'

import { SITES_TAG, SITE_STICKS, syncSiteSticks } from './alignmentSites'
import { applyColorTheme } from './applyColorTheme'
import { registerColorThemes } from './colorThemes'
import { removeMolstarStructure } from './removeStructure'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'
import { loadCaOnly } from '../test_data/molstarPlugin'

import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

const chains = [
  { asym: 'A', entity: '1', residues: ['MET', 'LYS', 'VAL', 'ALA'] },
  { asym: 'B', entity: '2', residues: ['GLY', 'GLY'] },
]

const color = {
  field: 'accession' as const,
  domain: ['cd:tetramer', 'cd:heme'],
  range: ['#7cae00', '#00bfc4'],
  labels: ['tetramer interface', 'heme binding site'],
}

const heme = Color.toStyle(Color(0x00bfc4))
const tetramer = Color.toStyle(Color(0x7cae00))

function siteCells(plugin: PluginContext) {
  const component = plugin.state.data.select(
    StateSelection.Generators.ofTransformer(
      StateTransforms.Model.StructureComponent,
    ).withTag(SITES_TAG),
  )
  const representation = plugin.state.data.select(
    StateSelection.Generators.ofTransformer(
      StateTransforms.Representation.StructureRepresentation3D,
    ).withTag(SITES_TAG),
  )
  return { component, representation }
}

// `${asym}${label_seq_id}` → the color the sticks' theme gives each atom
function stickColors(plugin: PluginContext) {
  const { component, representation } = siteCells(plugin)
  const structure = component[0]!.obj!.data as Structure
  const params = representation[0]!.transform.params!
  const theme =
    plugin.representation.structure.themes.colorThemeRegistry.create(
      params.colorTheme.name,
      { structure },
      params.colorTheme.params,
    )
  if (!('color' in theme)) {
    throw new Error(`expected a location theme, got ${theme.granularity}`)
  }
  const byResidue: Record<string, string> = {}
  const l = StructureElement.Location.create(structure)
  for (const unit of structure.units) {
    l.unit = unit
    for (const element of Array.from(unit.elements)) {
      l.element = element
      byResidue[`${SP.chain.label_asym_id(l)}${SP.residue.label_seq_id(l)}`] =
        Color.toStyle(theme.color(l, false))
    }
  }
  return { type: params.type.name, byResidue }
}

test("a site's residues get sticks in the site's color, which a recolor leaves alone and removal takes", async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    registerColorThemes(plugin)
    const [structure] = (await loadCaOnly(plugin, chains)).structures
    if (!structure) {
      throw new Error('no structure loaded')
    }
    const sync = (byLabelSeqId?: Map<number, number>) =>
      syncSiteSticks({
        plugin,
        structures: [
          {
            molstarStructure: structure,
            sites: byLabelSeqId && { entityId: '1', byLabelSeqId },
            color,
          },
        ],
      })

    await sync(
      new Map([
        [2, 1],
        [4, 0],
      ]),
    )
    expect(stickColors(plugin)).toEqual({
      type: 'ball-and-stick',
      byResidue: { A2: heme, A4: tetramer },
    })
    expect(
      siteCells(plugin).representation[0]!.transform.params!.type.params,
    ).toMatchObject(SITE_STICKS)

    await applyColorTheme({
      plugin,
      color: { field: 'chain' },
      structures: [{ molstarStructure: structure }],
    })
    expect(stickColors(plugin).byResidue).toEqual({
      A2: heme,
      A4: tetramer,
    })

    // a site switched off in the alignment's legend
    await sync(new Map([[4, 0]]))
    expect(siteCells(plugin).component).toHaveLength(1)
    expect(stickColors(plugin).byResidue).toEqual({ A4: tetramer })

    // the scheme changed away from the alignment domains
    await sync(undefined)
    expect(siteCells(plugin).component).toHaveLength(0)
    expect(siteCells(plugin).representation).toHaveLength(0)

    await sync(new Map([[2, 1]]))
    expect(siteCells(plugin).representation).toHaveLength(1)
    await removeMolstarStructure({ plugin, molstarStructure: structure })
    expect(siteCells(plugin).component).toHaveLength(0)
    expect(siteCells(plugin).representation).toHaveLength(0)
  })
})
