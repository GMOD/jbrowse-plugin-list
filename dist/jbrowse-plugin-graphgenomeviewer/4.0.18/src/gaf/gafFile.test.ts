// @vitest-environment node
import fs from 'fs'
import path from 'path'
import zlib from 'zlib'

import { TabixIndexedFile } from '@gmod/tabix'

import { GafFile, MAX_READS, UnindexedGafTooLargeError } from './gafFile.ts'

const dir = path.join(__dirname, '../../test_data/cactus')
const bytes = fs.readFileSync(path.join(dir, 'cactus_240_280.gaf'))

function inMemory(data: Uint8Array, size = data.length) {
  return {
    stat: async () => ({ size }),
    readFile: async () => data,
  }
}

const names = (...ids: number[]) => new Set(ids.map(String))

test('an unindexed GAF answers the reads touching the named segments', async () => {
  const gaf = new GafFile(inMemory(bytes))
  const { records, total } = await gaf.readsOver(names(249))
  expect(total).toBeGreaterThan(0)
  expect(records).toHaveLength(total)
  expect(records.every(r => r.path.some(step => step.name === '249'))).toBe(
    true,
  )
  expect((await gaf.readsOver(names(1, 2))).total).toBe(0)
})

// the bgzipped copy is sorted by node id for tabix, so compare as sets
const unordered = (records: unknown[]) =>
  records.map(r => JSON.stringify(r)).sort()

test('gzipped and bgzipped GAF read the same as plain', async () => {
  const read = async (data: Uint8Array) =>
    unordered((await new GafFile(inMemory(data)).readsOver(names(250))).records)
  const plain = await read(bytes)
  expect(await read(zlib.gzipSync(bytes))).toEqual(plain)
  expect(
    await read(fs.readFileSync(path.join(dir, 'cactus_240_280.gaf.gz'))),
  ).toEqual(plain)
})

test('an indexed GAF answers the same reads as reading it whole', async () => {
  const gz = path.join(dir, 'cactus_240_280.gaf.gz')
  const indexed = new GafFile(
    inMemory(fs.readFileSync(gz)),
    new TabixIndexedFile({ path: gz, tbiPath: `${gz}.tbi` }),
  )
  const whole = new GafFile(inMemory(bytes))
  for (const ids of [names(249), names(250, 251, 260), names(1, 2)]) {
    const { records } = await indexed.readsOver(ids)
    expect(unordered(records)).toEqual(
      unordered((await whole.readsOver(ids)).records),
    )
  }
  expect((await indexed.readsOver(names(249))).total).toBeGreaterThan(0)
})

test('a large unindexed GAF asks for an index instead', async () => {
  const gaf = new GafFile(inMemory(bytes, 60 * 2 ** 20))
  await expect(gaf.readsOver(names(250))).rejects.toThrow(
    UnindexedGafTooLargeError,
  )
})

test('more reads than the tube map lays out are sampled evenly', async () => {
  const line = bytes.toString().split('\n')[0]!
  const many = new TextEncoder().encode(
    Array.from({ length: MAX_READS * 2 + 1 }, () => line).join('\n'),
  )
  const { records, total } = await new GafFile(inMemory(many)).readsOver(
    new Set(line.split('\t')[5]!.split(/[<>]/).filter(Boolean)),
  )
  expect(total).toBe(MAX_READS * 2 + 1)
  expect(records).toHaveLength(MAX_READS)
})
