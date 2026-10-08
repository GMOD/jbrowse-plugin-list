import { existsSync } from 'node:fs'

import { firstValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

import Adapter from './RgfaTabixAdapter.ts'
import configSchema from './configSchema.ts'

// chr22 of HPRC v2.1 at base level, walk-indexed under 64 kb chunks of both
// GRCh38 and CHM13, built 2026-10-08 under ~/work/scratch/walks-20261008/spike.
// Skipped where the files are absent.
const spikePrefix = '/home/cdiesh/work/scratch/walks-20261008/spike/chr22'
const present = existsSync(`${spikePrefix}.walks.bed.gz`)
// the same graph from the Rust builder: rows under their chunk's first base, a
// chunk:i: header line, and an LN:i: column after each node row
const rustPrefix = '/home/cdiesh/work/scratch/walks-20261008/rust/final/chr22'
const rustPresent = existsSync(`${rustPrefix}.walks.bed.gz`)

function makeAdapter(prefix = spikePrefix, slots = {}) {
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

const walkNames = (gfa: string) =>
  gfa
    .split('\n')
    .filter(l => l.startsWith('W\t'))
    .map(l => l.split('\t').slice(1, 4).join('#'))

const window = {
  refName: 'chr22',
  assemblyName: 'hg38',
  start: 20_000_000,
  end: 20_100_000,
}

test.skipIf(!present)(
  'a walk-indexed cut carries a W line per haplotype',
  async () => {
    const gfa = await makeAdapter().getSubgraph(window)
    const lines = gfa.split('\n')
    expect(walkNames(gfa).length).toBeGreaterThan(400)
    expect(lines.filter(l => l.startsWith('S\t')).length).toBeGreaterThan(1000)
    expect(walkNames(gfa)).toContain('GRCh38#0#chr22')
  },
)

test.skipIf(!present)(
  'a cut for some haplotypes decodes those and the reference',
  async () => {
    const gfa = await makeAdapter().getSubgraph(window, {
      haplotypes: ['HG002', 'HG00097#2'],
    })
    const samples = new Set(
      walkNames(gfa).map(n => n.split('#').slice(0, 2).join('#')),
    )
    expect([...samples].sort()).toEqual([
      'GRCh38#0',
      'HG00097#2',
      'HG002#1',
      'HG002#2',
    ])
  },
)

test.skipIf(!present)('a CHM13 window cuts from the same files', async () => {
  const gfa = await makeAdapter().getSubgraph({
    ...window,
    assemblyName: 'hs1',
  })
  expect(walkNames(gfa)).toContain('CHM13#0#chr22')
  expect(walkNames(gfa).length).toBeGreaterThan(400)
})

test.skipIf(!present)(
  'the densest chunk is past the step budget for every haplotype',
  async () => {
    const cut = makeAdapter().getSubgraph({
      ...window,
      start: 11_800_000,
      end: 11_864_000,
    })
    await expect(cut).rejects.toMatchObject({
      name: 'NodeLimitError',
      regionTooLarge: true,
      message: expect.stringMatching(/choose fewer haplotypes/),
    })
  },
)

test.skipIf(!present || !rustPresent)(
  'first-base rows cut as whole-chunk rows do, sized by their header',
  async () => {
    const haplotypes = ['HG002', 'HG00097#2']
    const walks = (gfa: string) =>
      gfa.split('\n').filter(l => l.startsWith('W\t'))
    const spike = await makeAdapter().getSubgraph(window, { haplotypes })
    const rust = await makeAdapter(rustPrefix, { walkChunk: 1000 }).getSubgraph(
      window,
      { haplotypes },
    )
    expect(walks(rust)).toEqual(walks(spike))
    expect(rust).not.toMatch(/LN:i:\d+\tSN:Z:[^\n]*LN:i:/)
  },
)

// Node 2495598 spans chr22:19,988,476-19,988,793 and is filed under the chunk
// before the one starting at 19,988,480
test.skipIf(!rustPresent)(
  'getFeatures reads the chunk before the window for a node crossing into it',
  async () => {
    const features = await firstValueFrom(
      makeAdapter(rustPrefix)
        .getFeatures({ ...window, start: 19_988_480, end: 19_988_600 })
        .pipe(toArray()),
    )
    expect(features.map(f => f.get('name'))).toContain('2495598')
  },
)
