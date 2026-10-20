import { identityUniProtPositionMap, makeUniProtPositionMap } from 'p2s_mapper'
import { expect, test } from 'vitest'

import { layoutFeature } from './useProteinFeatureTrackData'

import type { UniProtFeature } from './useUniProtFeatures'

function feature(start: number, end: number): UniProtFeature {
  return {
    type: 'Domain',
    start,
    end,
    description: '',
    uniqueId: `Domain-${start}-${end}`,
  }
}

// An ungapped alignment over a 219-residue structure: structure position n is
// alignment column n.
const ungapped = Object.fromEntries(
  Array.from({ length: 219 }, (_, i) => [i, i]),
)

// 1TUP: UniProt 94-312 is SEQRES 1-219, i.e. structure positions 0-218
const map1tup = makeUniProtPositionMap([
  { entityId: '3', unpStart: 94, unpEnd: 312, structStart: 0, structEnd: 218 },
])

test('alphafold: uniprot positions are structure positions', () => {
  const layout = layoutFeature(
    feature(102, 292),
    Object.fromEntries(Array.from({ length: 393 }, (_, i) => [i, i])),
    identityUniProtPositionMap,
  )
  expect(layout?.structureStart).toBe(101)
  expect(layout?.structureEnd).toBe(292)
})

test('pdb: a sifts offset shifts the feature onto the modeled residues', () => {
  // p53 DNA-binding domain, UniProt 102-292
  const layout = layoutFeature(feature(102, 292), ungapped, map1tup)
  expect(layout?.structureStart).toBe(8)
  expect(layout?.structureEnd).toBe(199)
  expect(layout?.alignmentStart).toBe(8)
  expect(layout?.alignmentEnd).toBe(198)
})

test('pdb: a feature absent from the modeled region is dropped', () => {
  // p53's transactivation domain (UniProt 1-42) is absent from 1TUP
  expect(layoutFeature(feature(1, 42), ungapped, map1tup)).toBeUndefined()
})

test('pdb: a feature straddling the construct is clipped to what is there', () => {
  const tail = layoutFeature(feature(300, 350), ungapped, map1tup)
  expect(tail?.structureStart).toBe(206)
  expect(tail?.structureEnd).toBe(219)
  expect(tail?.clipped).toBe(true)

  const whole = layoutFeature(feature(1, 393), ungapped, map1tup)
  expect(whole?.alignmentStart).toBe(0)
  expect(whole?.alignmentEnd).toBe(218)

  expect(layoutFeature(feature(102, 292), ungapped, map1tup)?.clipped).toBe(
    false,
  )
})

test('a bond with one residue missing is dropped, not drawn as half a bond', () => {
  const bond = { ...feature(90, 100), type: 'Disulfide bond' }
  expect(layoutFeature(bond, ungapped, map1tup)).toBeUndefined()
})

test('clips to the residues that have an alignment column', () => {
  // a local alignment that kept structure position 8 alone
  const layout = layoutFeature(feature(102, 292), { 8: 8 }, map1tup)
  expect(layout?.alignmentStart).toBe(8)
  expect(layout?.alignmentEnd).toBe(8)
  expect(layout?.structureEnd).toBe(9)
  expect(layout?.clipped).toBe(true)

  expect(layoutFeature(feature(102, 292), {}, map1tup)).toBeUndefined()
})
