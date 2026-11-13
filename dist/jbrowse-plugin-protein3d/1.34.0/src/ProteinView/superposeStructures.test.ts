// @vitest-environment jsdom
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { StateSelection } from 'molstar/lib/mol-state'
import { expect, test } from 'vitest'

import { superposeStructures } from './superposeStructures'
import { describeSuperposition } from './superpositionOutcome'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'
import { loadCaOnly } from '../test_data/molstarPlugin'

import type { LoadMapping } from './superposeStructures'
import type { TestChain } from '../test_data/molstarStructure'
import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

const chain = {
  asym: 'A',
  entity: '1',
  residues: Array.from({ length: 30 }, () => 'ALA'),
}

function load(
  label: string,
  structures: readonly Structure[],
  mapping?: LoadMapping,
) {
  return { label, structures, mapping }
}

const residues = (n: number, comp = 'ALA') =>
  Array.from({ length: n }, () => comp)

// label_seq_id 1.. aligned to transcript positions from `start`, each
// spelled `code`
function mapped(
  entityId: string,
  n: number,
  {
    start = 0,
    drawnChains,
    code = 'A',
  }: {
    start?: number
    drawnChains?: string[]
    code?: string
  } = {},
) {
  return {
    entityId,
    residues: new Map(
      Array.from(
        { length: n },
        (_, i) => [i + 1, { transcript: start + i, code }] as const,
      ),
    ),
    drawnChains,
  }
}

async function superposeTwo(
  pivotChains: TestChain[],
  pivotMapping: LoadMapping | undefined,
  mobileChains: TestChain[],
  mobileMapping: LoadMapping | undefined,
  options?: { drawChains?: string[] },
) {
  let result: Awaited<ReturnType<typeof superposeStructures>> = []
  let moved: ReturnType<typeof transforms> = []
  await withTemporaryMolstarPlugin(async plugin => {
    const pivot = await loadCaOnly(plugin, pivotChains)
    const mobile = await loadCaOnly(plugin, mobileChains, options)
    result = await superposeStructures(plugin, [
      load('pivot', pivot.structures, pivotMapping),
      load('mobile', mobile.structures, mobileMapping),
    ])
    moved = transforms(plugin)
  })
  return { outcome: result[1], pivotOutcome: result[0], moved }
}

// the superposition transforms in the state tree, as their matrices
function transforms(plugin: PluginContext) {
  return plugin.state.data
    .select(
      StateSelection.Generators.ofTransformer(
        StateTransforms.Model.TransformStructureConformation,
      ),
    )
    .map(cell => {
      const t = cell.transform.params?.transform
      return t?.name === 'matrix' ? Array.from(t.params.data) : undefined
    })
}

// Mol*'s own structure list holds an ensemble's models as separate structures,
// and superposing from it TM-aligned each of an NMR entry's twenty models on
// its own, onto its sibling.
test('an ensemble moves as one unit, by one transform', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const pivot = await loadCaOnly(plugin, [chain])
    const ensemble = await loadCaOnly(plugin, [chain], { models: 4 })
    await superposeStructures(plugin, [
      load('pivot', pivot.structures),
      load('ensemble', ensemble.structures),
    ])
    const moved = transforms(plugin)
    expect(moved).toHaveLength(4)
    expect(new Set(moved.map(m => JSON.stringify(m))).size).toBe(1)
  })
})

// Superposition runs as soon as a second structure has loaded, which is when
// Mol*'s published hierarchy can lag; found through it, the newcomer was
// skipped and left where it loaded.
test('a structure the published hierarchy has not caught up with is moved', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    await plugin.dataTransaction(async () => {
      const pivot = await loadCaOnly(plugin, [chain])
      const other = await loadCaOnly(plugin, [chain])
      await superposeStructures(plugin, [
        load('pivot', pivot.structures),
        load('other', other.structures),
      ])
    })
    expect(transforms(plugin)).toHaveLength(1)
  })
})

test('an ensemble as the pivot stays where it is', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const ensemble = await loadCaOnly(plugin, [chain], { models: 4 })
    const single = await loadCaOnly(plugin, [chain])
    await superposeStructures(plugin, [
      load('ensemble', ensemble.structures),
      load('single', single.structures),
    ])
    expect(transforms(plugin)).toHaveLength(1)
  })
})

const gene: TestChain = { asym: 'A', entity: '1', residues: residues(40) }
const partner: TestChain = {
  asym: 'B',
  entity: '2',
  residues: residues(60, 'GLY'),
}

// TM-align flattens every chain it is given into one: a partner, another copy
// or a DNA strand steered the fit, and 7OW4's MHC heavy chain landed on NRAS.
test('a mapped structure aligns by its mapped chain alone', async () => {
  const { outcome, pivotOutcome } = await superposeTwo(
    [gene, partner],
    mapped('1', 40),
    [
      { ...partner, asym: 'A' },
      { ...gene, asym: 'B' },
    ],
    mapped('1', 40),
  )
  expect(pivotOutcome).toBeUndefined()
  expect(outcome).toMatchObject({
    method: 'tm-align',
    structure: { label: 'mobile', chain: 'B' },
    pivot: { label: 'pivot', chain: 'A' },
    alignedLength: 40,
    pairs: { count: 40 },
  })
  expect(outcome?.method === 'tm-align' && outcome.pairs?.rmsd).toBeLessThan(
    0.1,
  )
})

test('of several copies the first drawn one is aligned', async () => {
  const dimer = [gene, { ...gene, asym: 'B' }]
  const first = await superposeTwo(
    [gene],
    mapped('1', 40),
    dimer,
    mapped('1', 40),
  )
  expect(first.outcome?.structure.chain).toBe('A')
  const drawn = await superposeTwo(
    [gene],
    mapped('1', 40),
    dimer,
    mapped('1', 40, { drawnChains: ['B'] }),
    { drawChains: ['B'] },
  )
  expect(drawn.outcome?.structure.chain).toBe('B')
})

test('a structure with no mapping aligns whole, as before', async () => {
  const { outcome } = await superposeTwo(
    [gene, partner],
    mapped('1', 40),
    [gene, partner],
    undefined,
  )
  expect(outcome).toMatchObject({
    method: 'tm-align',
    structure: { label: 'mobile', chain: undefined },
    pairs: undefined,
  })
})

// a 10-residue peptide gives TM-align no fold to find
test('a short mapped chain is fit on its residue pairs', async () => {
  const { outcome, moved } = await superposeTwo(
    [gene],
    mapped('1', 40),
    [{ ...gene, residues: residues(10) }, partner],
    mapped('1', 10, { start: 4 }),
  )
  expect(outcome).toMatchObject({
    method: 'residue-pairs',
    reason: { kind: 'short', residues: 10, of: { chain: 'A' } },
    pairs: { count: 10, identity: 1 },
  })
  expect(
    outcome?.method === 'residue-pairs' && outcome.pairs.rmsd,
  ).toBeLessThan(0.1)
  expect(moved).toHaveLength(1)
})

test('a chain with no shared fold is fit on its residue pairs', async () => {
  const { outcome } = await superposeTwo(
    [gene],
    mapped('1', 40),
    [{ ...gene, extended: true }],
    mapped('1', 40),
  )
  expect(outcome).toMatchObject({
    method: 'residue-pairs',
    reason: { kind: 'dissimilar' },
    pairs: { count: 40 },
  })
})

test('with too few residue pairs to fit, the structure stays put', async () => {
  const { outcome, moved } = await superposeTwo(
    [gene],
    mapped('1', 40),
    [{ ...gene, residues: residues(10) }],
    mapped('1', 3),
  )
  expect(outcome).toMatchObject({
    method: 'unmoved',
    reason: { kind: 'short' },
    pairs: { count: 3 },
  })
  expect(moved).toEqual([])
})

// 7OW4's NRAS peptide pairs 8 of 8 residues with the NRAS model and is fit on
// them; NRAS re-mapped to 9BTM's SHOC2 paired 48 chance residues at 27%, and
// a fit on those put a leucine-rich repeat on a GTPase at 10.9 Å
test('residue pairs too unalike to be the same protein do not move it', async () => {
  const { outcome, moved } = await superposeTwo(
    [gene],
    mapped('1', 40),
    [{ ...gene, extended: true, residues: residues(40, 'GLY') }],
    mapped('1', 40, { code: 'G' }),
  )
  expect(outcome).toMatchObject({
    method: 'unmoved',
    reason: { kind: 'dissimilar' },
    pairs: { count: 40, identity: 0 },
  })
  expect(outcome && describeSuperposition(outcome)).toMatch(
    /are 0% identical, under the 50% that says they are the same protein's/,
  )
  expect(moved).toEqual([])
})
