// @vitest-environment jsdom
import {
  StructureElement,
  StructureProperties as SP,
} from 'molstar/lib/mol-model/structure'
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { StateSelection } from 'molstar/lib/mol-state'
import { Color } from 'molstar/lib/mol-util/color'
import { expect, test } from 'vitest'

import { applyColorTheme, colorLegendOf } from './applyColorTheme'
import { registerColorThemes } from './colorThemes'
import { ExonColorThemeProvider } from './exonColorTheme'
import { exonColor } from './exons'
import { NO_VALUE_COLOR } from './placedValueRegistry'
import { molstarThemeOf } from './proteinColor'
import { RESIDUE_COLORS } from './residueColors'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'
import { loadCaOnly } from '../test_data/molstarPlugin'

import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

const chains = [
  { asym: 'A', entity: '1', residues: ['MET', 'LYS', 'VAL', 'ALA'] },
  { asym: 'B', entity: '2', residues: ['GLY', 'GLY'] },
]

const blocks = Array.from({ length: 11 }, (_, i) => ({
  start: i * 100,
  end: i * 100 + 50,
}))
const color = exonColor({ blocks, numbering: 'transcript' })
const palette = RESIDUE_COLORS.exon.range

const style = (css: string) => Color.toStyle(Color.fromHexStyle(css))
const grey = Color.toStyle(NO_VALUE_COLOR)

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

test('the exon field paints through the registered exon theme', () => {
  expect(molstarThemeOf({ field: 'exon' })).toBe(ExonColorThemeProvider.name)
})

test("paints each mapped residue its exon's color, the palette repeating, the rest grey", async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    registerColorThemes(plugin)
    const [structure] = (await loadCaOnly(plugin, chains)).structures
    if (!structure) {
      throw new Error('no structure loaded')
    }
    await applyColorTheme({
      plugin,
      color: { field: 'exon' },
      structures: [
        {
          molstarStructure: structure,
          entityId: '1',
          placedValues: {
            entityId: '1',
            byLabelSeqId: new Map([
              [1, 1],
              [2, 2],
              [3, 10],
            ]),
          },
          exonColor: color,
        },
      ],
    })
    expect(colorByResidue(plugin, structure)).toEqual({
      A1: style(palette[0]),
      A2: style(palette[1]),
      A3: style(palette[0]),
      A4: grey,
      B1: grey,
      B2: grey,
    })
  })
})

test('the legend keys each color with the exons it paints, then the grey', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    registerColorThemes(plugin)
    const [structure] = (await loadCaOnly(plugin, chains)).structures
    if (!structure) {
      throw new Error('no structure loaded')
    }
    const legend = colorLegendOf({
      plugin,
      color: { field: 'exon' },
      structure,
      exonColor: color,
    })
    expect(legend?.kind).toBe('table-legend')
    const table = legend?.kind === 'table-legend' ? legend.table : []
    expect(table).toHaveLength(palette.length + 1)
    expect(table[0]).toEqual(['Exons 1, 10', Color.fromHexStyle(palette[0])])
    expect(table[2]).toEqual(['Exon 3', Color.fromHexStyle(palette[2])])
    expect(table.at(-1)).toEqual(['Not mapped', NO_VALUE_COLOR])
  })
})
