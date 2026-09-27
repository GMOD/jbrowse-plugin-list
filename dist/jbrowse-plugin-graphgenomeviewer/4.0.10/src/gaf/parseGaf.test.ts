import fs from 'fs'
import path from 'path'

import { parseCs, parseGaf, parseGafLine, parseGafPath } from './parseGaf'

const GAF = fs.readFileSync(
  path.join(__dirname, '../../test_data/cactus/cactus_240_280.gaf'),
  'utf8',
)

test('a vg giraffe line: walk, offsets, mapping quality and cs', () => {
  const record = parseGafLine(
    'r1\t101\t0\t101\t+\t>249>250<251\t128\t36\t128\t96\t101\t47\tAS:i:96\tcs:Z::36*gc:55\ttp:A:S',
  )!
  expect(record.path).toEqual([
    { name: '249', strand: '+' },
    { name: '250', strand: '+' },
    { name: '251', strand: '-' },
  ])
  expect(record).toMatchObject({
    name: 'r1',
    strand: '+',
    pathLength: 128,
    pathStart: 36,
    pathEnd: 128,
    mappingQuality: 47,
    secondary: true,
    cs: ':36*gc:55',
  })
})

test('a path naming a stable sequence places the read on no segment', () => {
  expect(parseGafPath('chr1')).toBeUndefined()
  expect(
    parseGafLine('r\t10\t0\t10\t+\tchr1\t100\t5\t15\t10\t10\t60'),
  ).toBeUndefined()
})

test('every line of the cactus fixture parses', () => {
  const lines = GAF.trim().split('\n')
  const records = parseGaf(GAF)
  expect(records).toHaveLength(lines.length)
  expect(records.some(r => r.path[0]!.strand === '-')).toBe(true)
  expect(records.every(r => r.cs !== undefined)).toBe(true)
})

test('cs ops, bases uppercased and an intron read as walk skipped', () => {
  expect(parseCs(':36*gc=ACG+tt-aa~gt12ag:4')).toEqual([
    { op: 'match', length: 36 },
    { op: 'substitution', seq: 'C' },
    { op: 'match', length: 3 },
    { op: 'insertion', seq: 'TT' },
    { op: 'deletion', length: 2 },
    { op: 'match', length: 12 },
    { op: 'match', length: 4 },
  ])
})
