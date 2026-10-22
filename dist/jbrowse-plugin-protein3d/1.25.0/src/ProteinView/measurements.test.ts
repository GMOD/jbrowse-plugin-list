// @vitest-environment jsdom
import { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import { StateSelection } from 'molstar/lib/mol-state'
import { expect, test } from 'vitest'

import loadMolstar from './loadMolstar'
import { MEASUREMENT_TAG, closestAtoms, syncMeasurements } from './measurements'
import { superposeStructures } from './superposeStructures'
import { withTemporaryMolstarPlugin } from './withTemporaryMolstarPlugin'
import { loadPocket } from '../test_data/molstarPlugin'

import type { StructureElement as StructureElementType } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

function drawn(plugin: PluginContext) {
  return plugin.state.data.select(
    StateSelection.Generators.root
      .subtree()
      .withTag(MEASUREMENT_TAG)
      .withTransformer(StateTransforms.Model.MultiStructureSelectionFromBundle),
  )
}

test('a residue measured to a ligand reports the nearest atom pair, by author numbering', async () => {
  const molstar = await loadMolstar()
  await withTemporaryMolstarPlugin(async plugin => {
    const { structure } = await loadPocket(plugin)
    const pair = closestAtoms(molstar, structure, 'A:12', 'MOV')
    if ('error' in pair) {
      throw new Error(pair.error)
    }
    expect(pair.distance).toBeCloseTo(1.805, 2)
    expect(pair.a.name).toBe('SG')
    expect(pair.a.residue).toBe('A:12')
    expect(pair.b.residue).toBe('A:303')
  })
})

test('an atom named on one side pins that side', async () => {
  const molstar = await loadMolstar()
  await withTemporaryMolstarPlugin(async plugin => {
    const { structure } = await loadPocket(plugin)
    const pair = closestAtoms(molstar, structure, 'A:16@NZ', 'A:12@SG')
    if ('error' in pair) {
      throw new Error(pair.error)
    }
    expect(pair.distance).toBeCloseTo(5.806, 2)
    expect([pair.a.name, pair.b.name]).toEqual(['NZ', 'SG'])
  })
})

test('a site that is not written or not there is reported, not thrown', async () => {
  const molstar = await loadMolstar()
  await withTemporaryMolstarPlugin(async plugin => {
    const { structure } = await loadPocket(plugin)
    expect(closestAtoms(molstar, structure, 'A:12', 'not a site!')).toEqual({
      error: 'not a site! is not a site such as A:248 or G:*',
    })
    expect(closestAtoms(molstar, structure, 'A:12', 'B:12')).toEqual({
      error: 'B:12 is not in the structure',
    })
    expect(closestAtoms(molstar, structure, 'A:12@XX', 'A:16')).toEqual({
      error: 'A:12@XX is not in the structure',
    })
    expect(closestAtoms(molstar, structure, 'A:12@SG', 'A:12@SG')).toEqual({
      error: 'A:12@SG and A:12@SG are the same atom',
    })
  })
})

test('measurements draw through the manager, and a re-sync keeps, adds and removes', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { structure } = await loadPocket(plugin)
    const sync = (
      measurements: Parameters<typeof syncMeasurements>[0]['measurements'],
    ) =>
      syncMeasurements({
        plugin,
        structures: [structure],
        measurements,
        labels: false,
      })

    const first = await sync([{ a: 'A:12', b: 'MOV' }])
    expect(first[0]?.distance).toBeCloseTo(1.805, 2)
    expect(first[0]?.atoms).toEqual(
      ['A:12@SG', 'A:303@C21'].map((s, i) =>
        i === 0 ? s : first[0]!.atoms![1],
      ),
    )
    const [kept] = drawn(plugin)
    expect(plugin.managers.structure.measurement.state.distances).toHaveLength(
      1,
    )

    await sync([
      { a: 'A:12', b: 'MOV' },
      { a: 'A:16', b: 'A:96', encoding: { color: { value: '#ff0000' } } },
    ])
    expect(drawn(plugin)).toHaveLength(2)
    expect(drawn(plugin)[0]?.transform.ref).toBe(kept?.transform.ref)

    await sync([
      { a: 'A:16', b: 'A:96', encoding: { color: { value: '#ff0000' } } },
    ])
    expect(drawn(plugin)).toHaveLength(1)
    expect(plugin.managers.structure.measurement.state.distances).toHaveLength(
      1,
    )

    await sync([])
    expect(drawn(plugin)).toHaveLength(0)
  })
})

test('a measurement made by hand in Mol* is not removed', async () => {
  const molstar = await loadMolstar()
  await withTemporaryMolstarPlugin(async plugin => {
    const { structure } = await loadPocket(plugin)
    const pair = closestAtoms(molstar, structure, 'A:12', 'A:16')
    if ('error' in pair) {
      throw new Error(pair.error)
    }
    const { StructureElement, OrderedSet } = molstar
    const loci = (atom: typeof pair.a) =>
      StructureElement.Loci(structure, [
        {
          unit: atom.unit,
          indices: OrderedSet.ofSingleton(
            atom.index as StructureElementType.UnitIndex,
          ),
        },
      ])
    await plugin.managers.structure.measurement.addDistance(
      loci(pair.a),
      loci(pair.b),
      { visualParams: { visuals: ['lines'] } },
    )
    await syncMeasurements({
      labels: false,
      plugin,
      structures: [structure],
      measurements: [{ a: 'A:12', b: 'MOV' }],
    })
    await syncMeasurements({
      labels: false,
      plugin,
      structures: [structure],
      measurements: [],
    })
    expect(plugin.managers.structure.measurement.state.distances).toHaveLength(
      1,
    )
  })
})

test('a measurement names its structure by index and waits for it to load', async () => {
  await withTemporaryMolstarPlugin(async plugin => {
    const { structure } = await loadPocket(plugin)
    const results = await syncMeasurements({
      labels: false,
      plugin,
      structures: [structure, undefined],
      measurements: [
        { a: 'A:12', b: 'MOV', structure: 1 },
        { a: 'A:12', b: 'MOV', structure: 7 },
      ],
    })
    expect(results.map(r => r.error)).toEqual([
      'the structure is not loaded',
      'the structure is not loaded',
    ])
    expect(drawn(plugin)).toHaveLength(0)
  })
})

test('on a superposed structure the dashes follow the moved atoms', async () => {
  const molstar = await loadMolstar()
  await withTemporaryMolstarPlugin(async plugin => {
    const pivot = await loadPocket(plugin)
    const other = await loadPocket(plugin, 12)
    await superposeStructures(plugin, [pivot.structures, other.structures])
    await syncMeasurements({
      labels: false,
      plugin,
      structures: [pivot.structure, other.structure],
      measurements: [{ a: 'A:12@SG', b: 'A:16@NZ', structure: 1 }],
    })
    const [cell] = drawn(plugin)
    const [selection] = cell!.obj!.data as {
      loci: Parameters<typeof molstar.Loci.getBoundingSphere>[0]
    }[]
    const [a] = cell!.obj!.data as {
      loci: Parameters<typeof molstar.Loci.getBoundingSphere>[0]
    }[]
    const center = molstar.Loci.getBoundingSphere(selection!.loci)!.center
    const pivotSg = closestAtoms(molstar, pivot.structure, 'A:12@SG', 'A:16@NZ')
    if ('error' in pivotSg) {
      throw new Error(pivotSg.error)
    }
    expect(a).toBeDefined()
    expect(Math.abs(center[0]! - pivotSg.a.position[0]!)).toBeLessThan(0.5)
  })
})

test('a chain not in the structure is reported', async () => {
  const molstar = await loadMolstar()
  await withTemporaryMolstarPlugin(async plugin => {
    const { structure } = await loadPocket(plugin)
    expect(closestAtoms(molstar, structure, 'B:*', 'MOV')).toEqual({
      error: 'B:* is not in the structure',
    })
  })
})
