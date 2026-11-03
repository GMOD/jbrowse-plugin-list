import PluginManager from '@jbrowse/core/PluginManager'
import { ExpansionTooLargeError, formsCut } from '@jbrowse/graph-walks'
import { firstValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

import Adapter from './WalkFormsAdapter.ts'
import configSchema from './configSchema.ts'
import WalkFormsAdapterF from './index.ts'

import type * as GraphWalks from '@jbrowse/graph-walks'

vi.mock('@jbrowse/graph-walks', async importOriginal => {
  const actual = await importOriginal<typeof GraphWalks>()
  return { ...actual, formsCut: vi.fn(actual.formsCut) }
})

// Four walks over a 3.6 kb reference of six 600 bp nodes, in 1 kb chunks
// (RgfaTabixAdapter/walkFiles.test.ts builds on the same file):
//   W GRCh38  0 chr1 >1>2>3>4>5>6
//   W HG002   1 chr1 >1>2>7>4>5>6   7 (550 bp) replaces 3
//   W HG002   2 chr1 >1>2>3>4>8>6   8 (20 bp) replaces 5
//   W HG00097 1 chr1 >1>2>3>4>5>6
const walks =
  require.resolve('../RgfaTabixAdapter/test_data/walks5_header.GRCh38.walks.bed.gz')

const local = (path: string) => ({
  localPath: path,
  locationType: 'LocalPathLocation',
})

// Each test pins its own window, since the cut cache outlives an adapter
function makeAdapter(slots: Record<string, unknown>) {
  return new Adapter(
    configSchema.create({
      walksLocation: local(walks),
      walksIndex: { location: local(`${walks}.tbi`) },
      ...slots,
    }),
  )
}

const pinned = (start: number) => ({ refName: 'chr1', start, end: 3600 })

const region = (start: number, end: number, refName = 'chr1') => ({
  refName,
  assemblyName: 'hg38',
  start,
  end,
})

const featuresOf = (adapter: Adapter, query = region(0, 3600)) =>
  firstValueFrom(adapter.getFeatures(query).pipe(toArray()))

const placeholders = (features: Awaited<ReturnType<typeof featuresOf>>) =>
  features
    .filter(f => f.id().startsWith('forms-reference-'))
    .map(f => ({
      start: f.get('start'),
      end: f.get('end'),
      genotypes: f.get('genotypes'),
    }))

test('registers the adapter type', () => {
  const pm = new PluginManager()
  WalkFormsAdapterF(pm)
  pm.createPluggableElements()
  expect(pm.getAdapterType('WalkFormsAdapter').name).toBe('WalkFormsAdapter')
})

test('names the reference sample contigs as the assembly does', async () => {
  expect(await makeAdapter({ pinned: pinned(0) }).getRefNames()).toEqual([
    'chr1',
  ])
})

test('one source per form, labelled by share and change', async () => {
  const adapter = makeAdapter({ pinned: pinned(1) })
  expect(await adapter.getSourcesAndWarnings()).toEqual({
    sources: [
      { name: 'F1', label: '33% · ref', haplotypes: 1, forms: 1 },
      {
        name: 'F2',
        label: '33% · repl 600bp->550bp',
        haplotypes: 1,
        forms: 1,
      },
      { name: 'F3', label: '33% · del 580bp', haplotypes: 1, forms: 1 },
    ],
    warnings: [],
  })
})

test('features are the pinned window changes, with a genotype per form', async () => {
  const features = await featuresOf(makeAdapter({ pinned: pinned(2) }))
  expect(
    features.map(f => ({
      start: f.get('start'),
      end: f.get('end'),
      consequence: f.get('consequence'),
      svType: f.get('svType'),
      type: f.get('type'),
      genotypes: f.get('genotypes'),
    })),
  ).toEqual([
    {
      start: 1200,
      end: 1800,
      consequence: 'loss',
      svType: 'CPX',
      type: 'complex_substitution',
      genotypes: { F1: '0', F2: '1', F3: '0' },
    },
    {
      start: 2400,
      end: 3000,
      consequence: 'loss',
      svType: 'DEL',
      type: 'deletion',
      genotypes: { F1: '0', F2: '0', F3: '1' },
    },
  ])
})

test('a query with no change gives one reference placeholder', async () => {
  const adapter = makeAdapter({ pinned: pinned(3) })
  expect(placeholders(await featuresOf(adapter, region(1900, 2300)))).toEqual([
    { start: 1900, end: 1901, genotypes: { F1: '0', F2: '0', F3: '0' } },
  ])
  expect(
    placeholders(await featuresOf(adapter, region(0, 3600, 'chr2'))),
  ).toHaveLength(1)
  expect(
    placeholders(await featuresOf(adapter, region(2900, 3600))),
  ).toHaveLength(0)
})

test('a floor change regroups the cut without cutting again', async () => {
  vi.mocked(formsCut).mockClear()
  const fine = makeAdapter({ pinned: pinned(4), floorBp: 50 })
  const coarse = makeAdapter({ pinned: pinned(4), floorBp: 1000 })
  expect((await fine.getSourcesAndWarnings()).sources).toHaveLength(3)
  expect((await coarse.getSourcesAndWarnings()).sources).toEqual([
    { name: 'F1', label: '100% · ref', haplotypes: 3, forms: 1 },
  ])
  expect(placeholders(await featuresOf(coarse))).toEqual([
    { start: 0, end: 1, genotypes: { F1: '0' } },
  ])
  expect(formsCut).toHaveBeenCalledTimes(1)
})

test('exclude leaves samples out of every form', async () => {
  const adapter = makeAdapter({ pinned: pinned(5), exclude: ['HG002'] })
  expect((await adapter.getSourcesAndWarnings()).sources).toEqual([
    { name: 'F1', label: '100% · ref', haplotypes: 1, forms: 1 },
  ])
})

test('maxForms gives the smaller forms one empty row', async () => {
  const adapter = makeAdapter({ pinned: pinned(6), maxForms: 1 })
  const { sources, warnings } = await adapter.getSourcesAndWarnings()
  expect(sources.map(s => s.label)).toEqual(['33% · ref', 'other forms · 67%'])
  expect(warnings).toEqual([
    expect.stringMatching(/^Forms of chr1:7-3,600: 2 smaller forms/),
  ])
  expect(placeholders(await featuresOf(adapter))).toEqual([
    { start: 0, end: 1, genotypes: { F1: '0' } },
  ])
})

test('a pinned window past walkByteBudget says so, without a zoom-in notice', async () => {
  const error = await makeAdapter({ pinned: pinned(7), walkByteBudget: 1 })
    .getSourcesAndWarnings()
    .catch((e: unknown) => e)
  expect(error).toBeInstanceOf(Error)
  expect(error).not.toHaveProperty('regionTooLarge')
  expect(`${error}`).toMatch(
    /^Error: The pinned window chr1:8-3,600 is too large to cut for structural forms: .*walkByteBudget, 0\.0 MB\. .*Raise walkByteBudget$/,
  )
})

test('a window whose walks are too many to read in full says so', async () => {
  vi.mocked(formsCut).mockClear()
  vi.mocked(formsCut).mockRejectedValueOnce(
    new ExpansionTooLargeError(24_000_000, 16_000_000, 3592),
  )
  const error = await makeAdapter({ pinned: pinned(9) })
    .getSourcesAndWarnings()
    .catch((e: unknown) => e)
  expect(formsCut).toHaveBeenCalledWith(
    expect.anything(),
    expect.anything(),
    expect.objectContaining({ partial: false }),
  )
  expect(error).not.toHaveProperty('regionTooLarge')
  expect(`${error}`).toBe(
    'Error: The pinned window chr1:10-3,600 is too large to read every walk in full for structural forms: its walks take 24.0 M steps, over the 16.0 M step budget, and about 2.39Kbp of it fits. Pin a narrower window',
  )
})

test('an adapter with no pinned window says so', async () => {
  await expect(makeAdapter({}).getSourcesAndWarnings()).rejects.toThrow(
    /needs `pinned`/,
  )
})
