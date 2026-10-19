// @vitest-environment jsdom
import {
  StructureElement,
  StructureProperties as SP,
} from 'molstar/lib/mol-model/structure'
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { StateSelection } from 'molstar/lib/mol-state'
import { Color } from 'molstar/lib/mol-util/color'
import { expect, test } from 'vitest'

import { AlignmentDomainColorThemeProvider } from './alignmentDomainColorTheme'
import { applyColorTheme, colorSchemeLegend } from './applyColorTheme'
import { registerColorThemes } from './colorThemes'
import { NO_VALUE_COLOR } from './placedValueRegistry'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'
import { loadCaOnly } from '../test_data/molstarPlugin'

import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

const chains = [
  { asym: 'A', entity: '1', residues: ['MET', 'LYS', 'VAL', 'ALA'] },
  { asym: 'B', entity: '2', residues: ['GLY', 'GLY'] },
]

const domains = [
  { name: 'Hb beta-like', color: 0xf8766d },
  { name: 'heme binding site', color: 0x00bfc4 },
]

const style = (color: number) => Color.toStyle(Color(color))
const grey = Color.toStyle(NO_VALUE_COLOR)

// `${asym}${label_seq_id}` → the colour the representation's theme gives it
function colorByResidue(plugin: PluginContext, structure: Structure) {
  const [params] = plugin.state.data
    .select(
      StateSelection.Generators.ofTransformer(
        StateTransforms.Representation.StructureRepresentation3D,
      ),
    )
    .map(cell => cell.transform.params?.colorTheme)
  const theme =
    plugin.representation.structure.themes.colorThemeRegistry.create(
      params!.name,
      { structure },
      params!.params,
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
  return byResidue
}

test("paints each residue its domain's color, and recolours when the domains move", async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    registerColorThemes(plugin)
    const [structure] = (await loadCaOnly(plugin, chains)).structures
    if (!structure) {
      throw new Error('no structure loaded')
    }
    const apply = (byLabelSeqId: Map<number, number>) =>
      applyColorTheme({
        plugin,
        colorScheme: 'alignment-domains',
        structures: [
          {
            molstarStructure: structure,
            entityId: '1',
            placedValues: { entityId: '1', byLabelSeqId },
            domains,
          },
        ],
      })
    await apply(
      new Map([
        [1, 0],
        [2, 1],
        [3, 0],
      ]),
    )
    expect(colorByResidue(plugin, structure)).toEqual({
      A1: style(0xf8766d),
      A2: style(0x00bfc4),
      A3: style(0xf8766d),
      A4: grey,
      B1: grey,
      B2: grey,
    })
    // the same palette with the site switched off
    await apply(new Map([[1, 0]]))
    expect(colorByResidue(plugin, structure).A2).toBe(grey)
  })
})

test('the legend names each domain in its color, then the grey', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    registerColorThemes(plugin)
    const [structure] = (await loadCaOnly(plugin, chains)).structures
    if (!structure) {
      throw new Error('no structure loaded')
    }
    const legend = colorSchemeLegend({
      plugin,
      colorScheme: 'alignment-domains',
      structure,
      domains: [...domains, domains[0]!],
    })
    expect(legend).toEqual({
      kind: 'table-legend',
      table: [
        ['Hb beta-like', 0xf8766d],
        ['heme binding site', 0x00bfc4],
        ['No domain', NO_VALUE_COLOR],
      ],
    })
    expect(AlignmentDomainColorThemeProvider.name).toBe('alignment-domains')
  })
})
