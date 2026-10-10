// @vitest-environment jsdom
import {
  StructureElement,
  StructureProperties as SP,
} from 'molstar/lib/mol-model/structure'
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { StateSelection } from 'molstar/lib/mol-state'
import { Color } from 'molstar/lib/mol-util/color'
import { expect, test } from 'vitest'

import { applyColorTheme, colorSchemeLegend } from './applyColorTheme'
import { registerColorThemes } from './colorThemes'
import {
  AlphaMissenseColorThemeProvider,
  ClinVarColorThemeProvider,
  NO_VALUE_COLOR,
  registerPlacedValues,
} from './variantEffectColorTheme'
import { alphaMissenseRgb, clinVarRgb } from './variantEffects'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'
import { loadCaOnly } from '../test_data/molstarPlugin'
import { parseStructure } from '../test_data/molstarStructure'

import type { Structure } from 'molstar/lib/mol-model/structure'

const chains = [
  { asym: 'A', entity: '1', residues: ['MET', 'LYS', 'VAL', 'ALA'] },
  { asym: 'B', entity: '2', residues: ['GLY', 'GLY'] },
]

function css([r, g, b]: readonly [number, number, number]) {
  return Color.toStyle(Color.fromRgb(r, g, b))
}

// `${asym}${label_seq_id}` → the colour the theme gives that residue
function colorByResidue(
  structure: Structure,
  theme: ReturnType<(typeof AlphaMissenseColorThemeProvider)['factory']>,
) {
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

const grey = Color.toStyle(NO_VALUE_COLOR)

test("colours the mapped entity's placed residues and greys the rest", async () => {
  const structure = await parseStructure(chains)
  registerPlacedValues('alphamissense', structure, {
    entityId: '1',
    byLabelSeqId: new Map([
      [1, 0],
      [3, 1],
    ]),
  })
  const theme = AlphaMissenseColorThemeProvider.factory(
    { structure },
    { revision: 0 },
  )
  expect(colorByResidue(structure, theme)).toEqual({
    A1: css(alphaMissenseRgb(0)),
    A2: grey,
    A3: css(alphaMissenseRgb(1)),
    A4: grey,
    B1: grey,
    B2: grey,
  })
})

test('each scheme reads its own values, and a model nobody registered is grey', async () => {
  const structure = await parseStructure(chains)
  const other = await parseStructure(chains)
  registerPlacedValues('clinvar', structure, {
    entityId: '1',
    byLabelSeqId: new Map([[2, 3]]),
  })
  const clinvar = ClinVarColorThemeProvider.factory(
    { structure },
    { revision: 0 },
  )
  expect(colorByResidue(structure, clinvar).A2).toBe(css(clinVarRgb(3)))
  const alphamissense = AlphaMissenseColorThemeProvider.factory(
    { structure },
    { revision: 0 },
  )
  expect(
    new Set(Object.values(colorByResidue(structure, alphamissense))),
  ).toEqual(new Set([grey]))
  const unregistered = ClinVarColorThemeProvider.factory(
    { structure: other },
    { revision: 0 },
  )
  expect(new Set(Object.values(colorByResidue(other, unregistered)))).toEqual(
    new Set([grey]),
  )
})

// every representation in the plugin, as the colour theme it carries
function themes(plugin: Parameters<typeof registerColorThemes>[0]) {
  return plugin.state.data
    .select(
      StateSelection.Generators.ofTransformer(
        StateTransforms.Representation.StructureRepresentation3D,
      ),
    )
    .map(cell => cell.transform.params?.colorTheme)
}

test('reaches every model of an ensemble, and recolours when values change', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    registerColorThemes(plugin)
    const { structures } = await loadCaOnly(plugin, chains, { models: 3 })
    expect(structures).toHaveLength(3)
    const apply = (score: number) =>
      applyColorTheme({
        plugin,
        colorScheme: 'alphamissense',
        structures: structures.map(molstarStructure => ({
          molstarStructure,
          entityId: '1',
          placedValues: {
            entityId: '1',
            byLabelSeqId: new Map([[4, score]]),
          },
        })),
      })
    await apply(0.1)
    const first = themes(plugin)
    expect(first).toHaveLength(3)
    expect(new Set(first.map(t => t?.name))).toEqual(new Set(['alphamissense']))
    for (const structure of structures) {
      const theme = AlphaMissenseColorThemeProvider.factory(
        { structure },
        { revision: 0 },
      )
      expect(colorByResidue(structure, theme).A4).toBe(
        css(alphaMissenseRgb(0.1)),
      )
    }
    // identical params would leave Mol*'s representations as they were
    await apply(0.9)
    const second = themes(plugin)
    second.forEach((t, i) => {
      expect(t?.params).not.toEqual(first[i]?.params)
    })
  })
})

test('the legends are the scales the themes paint with', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    registerColorThemes(plugin)
    const [structure] = (await loadCaOnly(plugin, chains)).structures
    if (!structure) {
      throw new Error('no structure loaded')
    }
    expect(
      colorSchemeLegend({ plugin, colorScheme: 'alphamissense', structure }),
    ).toMatchObject({
      kind: 'scale-legend',
      minLabel: 'Likely benign 0',
      maxLabel: 'Likely pathogenic 1',
    })
    const clinvar = colorSchemeLegend({
      plugin,
      colorScheme: 'clinvar',
      structure,
    })
    expect(clinvar).toMatchObject({ kind: 'table-legend' })
    expect(
      clinvar?.kind === 'table-legend' ? clinvar.table.map(([n]) => n) : [],
    ).toEqual(['0', '1', '2', '3', '4 or more', 'No value'])
  })
})
