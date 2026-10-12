import { existsSync } from 'node:fs'

import { graphTablesGFA } from '@jbrowse/bandage-core/gfa/graphTables'
import { firstValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

import Adapter from './RgfaTabixAdapter.ts'
import configSchema from './configSchema.ts'
import { walkRowsOf } from './walkRowRuns.ts'

import type { WalkCut } from './walkRowRuns.ts'
import type { GraphTables } from '@jbrowse/bandage-core/gfa/graphTables'

// Each walks_* fixture's paths and node lengths built again by gfa-to-tabix
// 0.11.0 (walks1_*, format 1 with pv and nx tags) and by format 2 (walks2_*).
// A format-2 cut is the format-1 cut: the same walks, nodes, positions and
// links, the same walk rows and the same reference features.

const dir = require
  .resolve('./test_data/walks_header.walks.bed.gz')
  .replace(/walks_header\.walks\.bed\.gz$/, '')

function makeAdapter(prefix: string, slots = {}) {
  const local = (path: string) => ({
    localPath: path,
    locationType: 'LocalPathLocation',
  })
  return new Adapter(
    configSchema.create({
      segmentsLocation: local(`${prefix}.nodes.bed.gz`),
      segmentsIndex: { location: local(`${prefix}.nodes.bed.gz.tbi`) },
      linksLocation: local(`${prefix}.links.bed.gz`),
      linksIndex: { location: local(`${prefix}.links.bed.gz.tbi`) },
      walksLocation: local(`${prefix}.walks.bed.gz`),
      walksIndex: { location: local(`${prefix}.walks.bed.gz.tbi`) },
      assemblyNameToPanSN: { hg38: 'GRCh38', hs1: 'CHM13' },
      ...slots,
    }),
  )
}

const gfaOf = async (cut: Promise<string | GraphTables>) => {
  const tables = await cut
  return typeof tables === 'string' ? tables : graphTablesGFA(tables)
}

const fixtures = [
  {
    name: 'header',
    windows: [
      [0, 600],
      [1000, 2600],
      [2100, 3600],
    ],
  },
  {
    name: 'maxnode',
    windows: [
      [2100, 2500],
      [0, 3800],
    ],
  },
  {
    name: 'rejoin',
    windows: [
      [1000, 1500],
      [0, 6000],
      [4000, 4200],
    ],
  },
  {
    name: 'follow',
    windows: [
      [1000, 1500],
      [0, 6000],
      [3500, 5200],
    ],
  },
] as const

const selections = [undefined, ['HG002#1'], ['HG002'], ['HG00097', 'HG003']]

describe.each(fixtures)('walks_$name in format 2', ({ name, windows }) => {
  const one = makeAdapter(`${dir}walks1_${name}.GRCh38`)
  const two = makeAdapter(`${dir}walks2_${name}.GRCh38`)

  test('names the same haplotypes', async () => {
    expect(await two.getHaplotypeNames()).toEqual(await one.getHaplotypeNames())
  })

  test.each(windows.map(([start, end]) => ({ start, end })))(
    'cuts $start-$end as format 1 does',
    async ({ start, end }) => {
      const region = { refName: 'chr1', assemblyName: 'hg38', start, end }
      for (const haplotypes of selections) {
        expect(await gfaOf(two.getSubgraph(region, { haplotypes }))).toEqual(
          await gfaOf(one.getSubgraph(region, { haplotypes })),
        )
      }
      const rows = async (adapter: Adapter) =>
        walkRowsOf(
          ((await adapter.getSubgraph(region, { walkRows: true })) as WalkCut)
            .walkRowRuns!,
        ).rows
      expect(await rows(two)).toEqual(await rows(one))
      const names = async (adapter: Adapter) =>
        (await firstValueFrom(adapter.getFeatures(region).pipe(toArray())))
          .map(f => f.get('name'))
          .sort()
      expect(await names(two)).toEqual(await names(one))
    },
  )
})

// chr22 of HPRC v2.1 in both formats, under ~/work/scratch/walks-20261008:
// f1-011 from gfa-to-tabix 0.11.0, f2 from format 2. Skipped where the files
// are absent.
const scratch = '/home/cdiesh/work/scratch/walks-20261008'
const chr22 = ['GRCh38', 'CHM13'].every(
  sample =>
    existsSync(`${scratch}/f1-011/chr22.${sample}.walks.bed.gz`) &&
    existsSync(`${scratch}/f2/chr22.${sample}.walks.bed.gz`),
)

// A node off the reference takes its position from the first-named path
// visiting it among the chunks a cut reads, where format 1 took it from every
// chunk: in the 22q11 repeats CHM13's piece through such a node can be filed
// under a chunk the cut does not read. Its S line keeps the same id, length
// and rank.
const offReferenceMoved = (line: string) =>
  line.startsWith('S\t') && line.endsWith('\tSR:i:1')
    ? line.replace(/\tSN:Z:[^\t]*\tSO:i:\d+/, '')
    : line

test.skipIf(!chr22)(
  'chr22 windows cut the same tables from either format',
  { timeout: 600_000 },
  async () => {
    let seed = 22
    const random = () => {
      seed = (seed * 1103515245 + 12345) % 2 ** 31
      return seed / 2 ** 31
    }
    const differ: Record<string, Record<string, number>> = {}
    for (const [sample, assemblyName, windows] of [
      ['GRCh38', 'hg38', 40],
      ['CHM13', 'hs1', 10],
    ] as const) {
      const one = makeAdapter(`${scratch}/f1-011/chr22.${sample}`)
      const two = makeAdapter(`${scratch}/f2/chr22.${sample}`)
      const names = (await two.getHaplotypeNames())!
      for (let k = 0; k < windows; k++) {
        const start = 16_000_000 + Math.floor(random() * 34_000_000)
        const end = start + 600 + Math.floor(random() * 99_400)
        const haplotypes =
          k % 10 === 9
            ? undefined
            : Array.from(
                { length: 8 },
                () => names[Math.floor(random() * names.length)]!,
              )
        const region = { refName: 'chr22', assemblyName, start, end }
        const a = await gfaOf(one.getSubgraph(region, { haplotypes }))
        const b = await gfaOf(two.getSubgraph(region, { haplotypes }))
        const [left, right] = [a, b].map(
          gfa => new Set(gfa.split('\n').map(offReferenceMoved)),
        )
        const count: Record<string, number> = {}
        for (const [from, to, sign] of [
          [left!, right!, '-'],
          [right!, left!, '+'],
        ] as const) {
          for (const line of from) {
            if (!to.has(line)) {
              count[`${sign}${line[0]}`] = (count[`${sign}${line[0]}`] ?? 0) + 1
            }
          }
        }
        if (Object.keys(count).length > 0) {
          differ[`${sample} ${start}-${end}`] = count
        }
      }
    }
    expect(differ).toEqual({})
  },
)
