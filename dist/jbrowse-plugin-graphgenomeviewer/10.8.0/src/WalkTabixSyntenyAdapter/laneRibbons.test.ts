import fs from 'node:fs'

import { firstValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

import Adapter from './WalkTabixSyntenyAdapter.ts'
import configSchema from './configSchema.ts'

import type { LaneFeatureOptions } from '../synteny/lanePairs.ts'
import type { SyntenyMate } from '@jbrowse/synteny-core'

const FIXTURES = [
  'chain',
  'follow',
  'header',
  'inversion',
  'lanepairs',
  'maxnode',
  'rejoin',
  'skip',
  'skipfollow',
  'skipinv',
  'twopart',
]
const WINDOWS = [
  [0, 1_000_000],
  [0, 3600],
  [700, 1100],
  [1200, 2400],
  [2000, 3000],
  [10_000, 50_000],
  [20_000, 35_000],
] as const
const OPTIONS: LaneFeatureOptions[] = [{}, { targetAssemblyName: 'HG002#1' }]

function makeAdapter(name: string, slots: Record<string, unknown> = {}) {
  const walks = require.resolve(
    `../RgfaTabixAdapter/test_data/walks8/${name}.GRCh38.walks.gz`,
  )
  return new Adapter(
    configSchema.create({
      walksLocation: { localPath: walks, locationType: 'LocalPathLocation' },
      walksIndex: {
        localPath: `${walks}.idx`,
        locationType: 'LocalPathLocation',
      },
      assemblyNames: ['hg38'],
      assemblyNameToPanSN: { hg38: 'GRCh38' },
      ...slots,
    }),
  )
}

function records(
  adapter: Adapter,
  [start, end]: readonly [number, number],
  opts: LaneFeatureOptions,
) {
  return firstValueFrom(
    adapter
      .getFeatures({ refName: 'chr1', assemblyName: 'hg38', start, end }, opts)
      .pipe(toArray()),
  )
}

async function everyReading(
  slots: Record<string, unknown>,
  opts: LaneFeatureOptions,
) {
  const out: Record<string, unknown> = {}
  for (const name of FIXTURES) {
    const adapter = makeAdapter(name, slots)
    out[`${name} header`] = await adapter.getHeader(opts)
    for (const window of WINDOWS) {
      for (const extra of OPTIONS) {
        out[`${name} ${window.join('-')} ${JSON.stringify(extra)}`] =
          await records(adapter, window, { ...opts, ...extra }).then(
            features => features.map(f => f.toJSON()),
            (error: unknown) => ({ error: `${error}` }),
          )
      }
    }
  }
  return out
}

const inversion = async (
  slots: Record<string, unknown>,
  opts: LaneFeatureOptions,
) => {
  const adapter = makeAdapter('inversion', slots)
  const features = await records(adapter, [0, 55_000], opts)
  return {
    header: await adapter.getHeader(opts),
    turned: features
      .filter(f => (f.get('mate') as SyntenyMate).assemblyName === 'HG002#1')
      .map(f => ({
        strand: f.get('strand'),
        start: f.get('start'),
        end: f.get('end'),
      })),
  }
}

const READ_FROM_PLACEMENT = [
  { strand: 1, start: 0, end: 20_000 },
  { strand: -1, start: 20_000, end: 35_000 },
  { strand: 1, start: 35_000, end: 55_000 },
]
const ALIGNED_AS_BEFORE = [
  { strand: 1, start: 0, end: 55_000 },
  { strand: -1, start: 20_000, end: 35_000 },
]

test('a display that says it reads lanes against the reference gets the header stating it and records read from the stored placement, under laneRibbons reference', async () => {
  const { header, turned } = await inversion(
    { laneRibbons: 'reference' },
    { readsLanesAgainstAnchor: true },
  )
  expect(header.lanesReadAgainstAnchor).toBe(true)
  expect(turned).toEqual(READ_FROM_PLACEMENT)
})

test.each([
  ['reference', {}],
  ['neighbours', { readsLanesAgainstAnchor: true }],
  ['neighbours', {}],
] as const)(
  'laneRibbons %s with %o answers as before: no header statement, and records aligned to the reference',
  async (laneRibbons, opts) => {
    const { header, turned } = await inversion({ laneRibbons }, opts)
    expect(header).not.toHaveProperty('lanesReadAgainstAnchor')
    expect(turned).toEqual(ALIGNED_AS_BEFORE)
  },
)

test('the default laneRibbons is reference', async () => {
  const { header } = await inversion({}, { readsLanesAgainstAnchor: true })
  expect(header.lanesReadAgainstAnchor).toBe(true)
})

const GOLDEN = require.resolve('./test_data/neighbours-10.5.1.json')

test.each([
  [{}, {}],
  [{ laneRibbons: 'neighbours' }, { readsLanesAgainstAnchor: true }],
] as const)(
  "with %o and %o every fixture's header and records are 10.5.1's, byte for byte",
  async (slots, opts) => {
    expect(JSON.stringify(await everyReading(slots, opts))).toBe(
      JSON.stringify(JSON.parse(fs.readFileSync(GOLDEN, 'utf8'))),
    )
  },
)
