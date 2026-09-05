import { expect, test } from 'vitest'

import { layoutFeature } from './useProteinFeatureTrackData'
import {
  identityUniProtPositionMap,
  makeUniProtPositionMap,
} from '../pdbUniProtMapping'

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
  // 1TUP: UniProt 94-312 is SEQRES 1-219, i.e. structure positions 0-218
  const map1tup = makeUniProtPositionMap([
    {
      entityId: '3',
      unpStart: 94,
      unpEnd: 312,
      structStart: 0,
      structEnd: 218,
    },
  ])
  // p53 DNA-binding domain, UniProt 102-292
  const layout = layoutFeature(feature(102, 292), ungapped, map1tup)
  expect(layout?.structureStart).toBe(8)
  expect(layout?.structureEnd).toBe(199)
  expect(layout?.alignmentStart).toBe(8)
  expect(layout?.alignmentEnd).toBe(198)
})

test('pdb: features outside the modeled region are dropped, not misplaced', () => {
  const map1tup = makeUniProtPositionMap([
    {
      entityId: '3',
      unpStart: 94,
      unpEnd: 312,
      structStart: 0,
      structEnd: 218,
    },
  ])
  // p53's transactivation domain (UniProt 1-42) is absent from 1TUP
  expect(layoutFeature(feature(1, 42), ungapped, map1tup)).toBeUndefined()
  // a feature straddling the end of the modeled region
  expect(layoutFeature(feature(300, 350), ungapped, map1tup)).toBeUndefined()
})

test('drops features whose structure position has no alignment column', () => {
  // structure position 8 is present, 198 is not (short alignment)
  const shortAlignment = { 8: 8 }
  const map1tup = makeUniProtPositionMap([
    {
      entityId: '3',
      unpStart: 94,
      unpEnd: 312,
      structStart: 0,
      structEnd: 218,
    },
  ])
  expect(
    layoutFeature(feature(102, 292), shortAlignment, map1tup),
  ).toBeUndefined()
})
