import { expect, test } from 'vitest'

import {
  hydrophobicityColor,
  kyteDoolittleScores,
  mapResidueValuesToColumns,
  plddtColor,
} from './residueTracks'

test('kyteDoolittleScores returns per-residue hydropathy, undefined for gaps', () => {
  // I=4.5 (most hydrophobic), R=-4.5 (most hydrophilic), X/'-' absent
  expect(kyteDoolittleScores('IRX-')).toEqual([4.5, -4.5, undefined, undefined])
})

test('plddtColor bins match molstar pLDDT thresholds', () => {
  expect(plddtColor(-1)).toBe('#cccccc') // no data
  expect(plddtColor(30)).toBe('#ff7d45') // very low
  expect(plddtColor(50)).toBe('#ff7d45') // boundary inclusive
  expect(plddtColor(60)).toBe('#ffdb13') // low
  expect(plddtColor(70)).toBe('#ffdb13')
  expect(plddtColor(80)).toBe('#65cbf3') // confident
  expect(plddtColor(90)).toBe('#65cbf3')
  expect(plddtColor(95)).toBe('#0053d6') // very high
})

test('hydrophobicityColor endpoints and midpoint', () => {
  expect(hydrophobicityColor(-4.5)).toBe('rgb(51, 102, 204)') // hydrophilic
  expect(hydrophobicityColor(4.5)).toBe('rgb(230, 140, 40)') // hydrophobic
  // clamps out-of-range
  expect(hydrophobicityColor(-100)).toBe('rgb(51, 102, 204)')
  expect(hydrophobicityColor(100)).toBe('rgb(230, 140, 40)')
})

test('mapResidueValuesToColumns maps structure positions through alignment', () => {
  // structure pos -> alignment column (gaps shift columns)
  const map = { 0: 0, 1: 1, 2: 3 } // residue 2 lands in column 3 (gap at col 2)
  const result = mapResidueValuesToColumns([90, 40, 75], map)
  expect(result).toEqual([
    { col: 0, value: 90 },
    { col: 1, value: 40 },
    { col: 3, value: 75 },
  ])
})

test('mapResidueValuesToColumns drops residues without value or column', () => {
  const map = { 0: 0, 2: 2 } // residue 1 has no alignment column
  const result = mapResidueValuesToColumns([10, 20, undefined], map)
  expect(result).toEqual([{ col: 0, value: 10 }])
})

test('mapResidueValuesToColumns returns empty without a map', () => {
  expect(mapResidueValuesToColumns([1, 2, 3], undefined)).toEqual([])
})
