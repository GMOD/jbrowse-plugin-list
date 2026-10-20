// @vitest-environment jsdom
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { StateSelection } from 'molstar/lib/mol-state'
import { expect, test } from 'vitest'

import {
  DEFAULT_HIGHLIGHT_COLOR,
  SESSION_HIGHLIGHTS_TAG,
  labelTextSize,
  sessionHighlightResidues,
  syncSessionHighlightMarks,
} from './sessionHighlights'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'
import { loadCaOnly } from '../test_data/molstarPlugin'

import type { GenomeHighlight } from './sessionHighlights'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

// minus strand: residue 0 on bases 109..107, residue 1 on 106..104, residue 2
// on 103..101; the structure starts at residue 1, numbered label_seq_id 5..
const g2p: Record<number, number> = {}
for (let base = 101; base < 110; base++) {
  g2p[base] = Math.floor((109 - base) / 3)
}

function residues(highlights: GenomeHighlight[], labels = true) {
  return sessionHighlightResidues({
    highlights,
    mapping: { g2p, refName: 'chr12' },
    naming: {
      canonicalRefName: r => r.replace(/^chr/, ''),
      isAssembly: name => name === 'hg38',
    },
    entity: { entityId: '1', seqIds: [5, 6] },
    transcriptToStructure: { 1: 0, 2: 1 },
    labels,
  })
}

const codon = (start: number, label?: string, color?: string) => ({
  assemblyName: 'hg38',
  refName: 'chr12',
  start,
  end: start + 3,
  label,
  color,
})

test("a codon marks the structure residue it codes, in core's highlight color by default", () => {
  expect(residues([codon(104, 'G12')])).toEqual([
    {
      entityId: '1',
      labelSeqIds: [5],
      label: 'G12',
      color: DEFAULT_HIGHLIGHT_COLOR,
    },
  ])
  expect(residues([codon(101, undefined, '#00f')])[0]?.color).toBe('#00f')
})

test('a region over the structure and off it marks only the residues it has', () => {
  expect(
    residues([{ assemblyName: 'hg38', refName: '12', start: 101, end: 110 }]),
  ).toEqual([
    {
      entityId: '1',
      labelSeqIds: [5, 6],
      label: undefined,
      color: DEFAULT_HIGHLIGHT_COLOR,
    },
  ])
  // residue 0 has no structure residue
  expect(residues([codon(107)])).toEqual([])
})

test('a highlight on another assembly or chromosome marks nothing', () => {
  expect(
    residues([
      { ...codon(104), assemblyName: 'mm39' },
      { ...codon(104), refName: 'chr7' },
    ]),
  ).toEqual([])
})

test('labels turned off in the session keep the sticks and drop the text', () => {
  expect(residues([codon(104, 'G12')], false)[0]?.label).toBeUndefined()
})

function tagged(plugin: PluginContext) {
  const cells = (transformer: unknown) =>
    plugin.state.data.select(
      StateSelection.Generators.root
        .subtree()
        .withTag(SESSION_HIGHLIGHTS_TAG)
        .filter(c => c.transform.transformer === transformer),
    )
  return {
    sticks: cells(StateTransforms.Representation.StructureRepresentation3D),
    labels: cells(StateTransforms.Representation.StructureSelectionsLabel3D),
  }
}

test('a labelled mark draws sticks and its label, and a re-sync replaces them', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const [molstarStructure] = (
      await loadCaOnly(plugin, [
        { asym: 'A', entity: '1', residues: Array(12).fill('ALA') },
      ])
    ).structures
    if (!molstarStructure) {
      throw new Error('no structure loaded')
    }
    const sync = (marks: Parameters<typeof residues>[0]) =>
      syncSessionHighlightMarks({
        plugin,
        structures: [{ molstarStructure, marks: residues(marks) }],
      })

    await sync([codon(104, 'G12'), codon(101)])
    const first = tagged(plugin)
    expect(first.sticks).toHaveLength(2)
    expect(first.labels.map(c => c.transform.params?.customText)).toEqual([
      'G12',
    ])

    await sync([codon(101, 'Q61')])
    const second = tagged(plugin)
    expect(second.sticks).toHaveLength(1)
    expect(second.labels.map(c => c.transform.params?.customText)).toEqual([
      'Q61',
    ])

    await sync([])
    expect(tagged(plugin).sticks).toHaveLength(0)
    expect(tagged(plugin).labels).toHaveLength(0)
  })
})

// haemoglobin's four β chains each carry Val6; four labels would stack
test('a homo-oligomer gets the sticks on every chain and the label once', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const [molstarStructure] = (
      await loadCaOnly(plugin, [
        { asym: 'A', entity: '1', residues: Array(12).fill('ALA') },
        { asym: 'B', entity: '1', residues: Array(12).fill('ALA') },
      ])
    ).structures
    if (!molstarStructure) {
      throw new Error('no structure loaded')
    }
    await syncSessionHighlightMarks({
      plugin,
      structures: [{ molstarStructure, marks: residues([codon(104, 'G12')]) }],
    })
    const { sticks, labels } = tagged(plugin)
    expect(labels).toHaveLength(1)
    const stickChains = new Set(
      (
        sticks[0]?.obj?.data as
          { sourceData: { units: { chainGroupId: number }[] } } | undefined
      )?.sourceData.units.map(u => u.chainGroupId),
    )
    expect(stickChains.size).toBe(2)
    const labelled = plugin.state.data.select(
      StateSelection.Generators.root
        .subtree()
        .withTag(SESSION_HIGHLIGHTS_TAG)
        .filter(
          c =>
            c.transform.transformer ===
            StateTransforms.Model.MultiStructureSelectionFromExpression,
        ),
    )[0]?.obj?.data as { loci: { elements: unknown[] } }[] | undefined
    expect(labelled?.[0]?.loci.elements).toHaveLength(1)
  })
})

test('labels on neighbouring residues lean apart on their tethers', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const [molstarStructure] = (
      await loadCaOnly(plugin, [
        { asym: 'A', entity: '1', residues: Array(12).fill('ALA') },
      ])
    ).structures
    if (!molstarStructure) {
      throw new Error('no structure loaded')
    }
    await syncSessionHighlightMarks({
      plugin,
      structures: [
        {
          molstarStructure,
          marks: residues([codon(104, 'G12'), codon(101, 'G13')]),
        },
      ],
    })
    const params = tagged(plugin).labels.map(c => c.transform.params)
    expect(params.map(p => p?.attachment)).toEqual(['bottom-left', 'top-right'])
    expect(params.every(p => p?.tether)).toBe(true)
  })
})

test('label size follows the structure, within bounds', () => {
  expect(labelTextSize(20)).toBe(3)
  expect(labelTextSize(50)).toBe(5)
  expect(labelTextSize(400)).toBe(8)
})
