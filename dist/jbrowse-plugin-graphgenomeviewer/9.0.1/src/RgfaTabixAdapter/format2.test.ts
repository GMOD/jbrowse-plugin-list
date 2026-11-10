import { readConfObject } from '@jbrowse/core/configuration'
import { firstValueFrom } from 'rxjs'
import { toArray } from 'rxjs/operators'

import Adapter from './RgfaTabixAdapter.ts'
import configSchema from './configSchema.ts'
import { buildAdapterConfig } from '../GraphAddTrackWorkflow/buildTrackConfig.ts'
import { bubblePrefix } from '../GraphGenomeView/pane/paneBase.ts'

// gfa-to-tabix 1.5's anchored index of test_data/ecoli_pggb_subgraph.gfa on
// K12, in format 1 (`pggb_ecoli_f1`, a segs/links pair) and format 2
// (`pggb_ecoli_f2.graph.bed.gz`, one file, carriers as SB:H: bits)
const DATA = require
  .resolve('./test_data/pggb_ecoli_f2.graph.bed.gz')
  .replace(/pggb_ecoli_f2\.graph\.bed\.gz$/, '')
const local = (path: string) => ({
  localPath: path,
  locationType: 'LocalPathLocation',
})

function formatOne() {
  const f = `${DATA}pggb_ecoli_f1`
  return new Adapter(
    configSchema.create({
      segmentsLocation: local(`${f}.segs.bed.gz`),
      segmentsIndex: { location: local(`${f}.segs.bed.gz.tbi`) },
      linksLocation: local(`${f}.links.bed.gz`),
      linksIndex: { location: local(`${f}.links.bed.gz.tbi`) },
    }),
  )
}

function formatTwo() {
  const f = `${DATA}pggb_ecoli_f2.graph.bed.gz`
  return new Adapter(
    configSchema.create({
      graphLocation: local(f),
      graphIndex: { location: local(`${f}.tbi`) },
    }),
  )
}

const window = (start: number) => ({
  refName: 'chr',
  assemblyName: 'K12',
  start,
  end: start + 60,
})

// A segment's carriers as a set, since format 2 names them in #samples order
const sorted = (samples: unknown) =>
  Array.isArray(samples) ? [...samples].sort() : samples

test('format 2 names the same reference sequences', async () => {
  expect(await formatTwo().getRefNames()).toEqual(
    await formatOne().getRefNames(),
  )
})

test('format 2 gives the carriage lane the same segments and carriers', async () => {
  const features = (adapter: Adapter, start: number) =>
    firstValueFrom(adapter.getFeatures(window(start)).pipe(toArray()))
  for (let start = 1004500; start < 1004961; start += 41) {
    const one = await features(formatOne(), start)
    const two = await features(formatTwo(), start)
    const shape = (f: (typeof one)[number]) => ({
      name: f.get('name'),
      start: f.get('start'),
      end: f.get('end'),
      rank: f.get('rank'),
      samples: sorted(f.get('samples')),
      sampleCount: f.get('sampleCount'),
    })
    expect(two.map(shape)).toEqual(one.map(shape))
    expect(two.every(f => (f.get('sampleCount') as number) > 0)).toBe(true)
  }
})

test('format 2 cuts the same graph', async () => {
  const lines = (gfa: unknown) =>
    String(gfa)
      .split('\n')
      .map(l => l.replace(/\tSM:Z:\S*/, ''))
  for (let start = 1004500; start < 1004961; start += 41) {
    const one = await formatOne().getSubgraph(window(start))
    const two = await formatTwo().getSubgraph(window(start))
    expect(lines(two)).toEqual(lines(one))
  }
})

test('the uri shorthand with format: 2 resolves the one file', () => {
  const config = configSchema.create({
    uri: 'hprc',
    format: 2,
    baseUri: 'https://example.com/',
  })
  expect(readConfObject(config, 'graphLocation')).toMatchObject({
    uri: 'hprc.graph.bed.gz',
    baseUri: 'https://example.com/',
  })
  expect(readConfObject(config, ['graphIndex', 'location'])).toMatchObject({
    uri: 'hprc.graph.bed.gz.tbi',
  })
})

test('Open track takes a format 2 graph file', () => {
  const loc = {
    uri: 'https://example.com/hprc.graph.bed.gz',
    locationType: 'UriLocation' as const,
  }
  const adapter = buildAdapterConfig({
    choice: 'RgfaTabixAdapter',
    loc,
    indexLoc: undefined,
    assembly: 'hg38',
    sample: 'GRCh38',
  })
  expect(adapter).toMatchObject({
    type: 'RgfaTabixAdapter',
    graphLocation: loc,
    graphIndex: {
      location: { uri: 'https://example.com/hprc.graph.bed.gz.tbi' },
    },
    assemblyNameToPanSN: { hg38: 'GRCh38' },
  })
  expect(adapter).not.toHaveProperty('segmentsLocation')
  expect(bubblePrefix(adapter)).toBe('https://example.com/hprc')
})
