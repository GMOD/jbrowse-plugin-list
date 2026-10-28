import { walksForRow } from './rowWalks'

const HPRC = [
  { name: 'GRCh38#0#chr6' },
  { name: 'HG00097#1#JBIRDD010000043.1' },
  { name: 'HG00097#2#JBIRDE010000011.1' },
  { name: 'HG00133#1#CM090050.1' },
]

test('a phased callset row counts haplotypes from 0', () => {
  expect(walksForRow('HG00097 HP0', HPRC)).toEqual([
    'HG00097#1#JBIRDD010000043.1',
  ])
  expect(walksForRow('HG00097 HP1', HPRC)).toEqual([
    'HG00097#2#JBIRDE010000011.1',
  ])
})

test('a MAF row counts haplotypes as PanSN does', () => {
  expect(walksForRow('HG00097.2', HPRC)).toEqual([
    'HG00097#2#JBIRDE010000011.1',
  ])
})

test('a bare sample stands for every walk of it', () => {
  expect(walksForRow('HG00097', HPRC)).toEqual([
    'HG00097#1#JBIRDD010000043.1',
    'HG00097#2#JBIRDE010000011.1',
  ])
  expect(walksForRow('GRCh38', HPRC)).toEqual(['GRCh38#0#chr6'])
})

test('a haploid row counts from 0 like any other', () => {
  expect(
    walksForRow('CFT073 HP0', [
      { name: 'K12#1#chr:1004500-1004961' },
      { name: 'CFT073#1#chr:1048100-1048700' },
    ]),
  ).toEqual(['CFT073#1#chr:1048100-1048700'])
})

test('a haplotype the cut does not hold names no walk', () => {
  expect(walksForRow('HG00133 HP1', HPRC)).toEqual([])
})

test('a bare sample ending in a version reads as the sample', () => {
  expect(
    walksForRow('GCA_000005845.2', [
      { name: 'GCA_000005845.2#0#chr' },
      { name: 'GCA_000008865.2#0#chr' },
    ]),
  ).toEqual(['GCA_000005845.2#0#chr'])
})

test('a row naming no sample in the graph names no walk', () => {
  expect(walksForRow('MICB', HPRC)).toEqual([])
  expect(walksForRow('s1278', HPRC)).toEqual([])
})
