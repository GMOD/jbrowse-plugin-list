import { SimpleFeature } from '@jbrowse/core/util'
import { expect, test, vi } from 'vitest'

import { resolveGeneLaunch, unambiguousEntry } from './resolveGeneLaunch'
import { rankIsoforms } from '../AlignTranscriptRpc'

import type { GeneLaunchHost } from './resolveGeneLaunch'
import type { AlphaFoldModel, UniProtEntry } from 'p2s_mapper'

const SHORT = 'MKAAL'
const LONG = 'MKAALGGSTPEW'

function transcript(uniqueId: string, extra: Record<string, unknown> = {}) {
  return {
    uniqueId,
    refName: 'chr1',
    start: 0,
    end: 100,
    type: 'mRNA',
    subfeatures: [
      {
        uniqueId: `${uniqueId}-cds`,
        refName: 'chr1',
        start: 0,
        end: 99,
        type: 'CDS',
      },
    ],
    ...extra,
  }
}

function gene(extra: Record<string, unknown> = {}) {
  return new SimpleFeature({
    uniqueId: 'gene',
    refName: 'chr1',
    start: 0,
    end: 100,
    type: 'gene',
    name: 'GENE1',
    subfeatures: [transcript('short'), transcript('long')],
    ...extra,
  })
}

const entry = (accession: string, isReviewed: boolean): UniProtEntry => ({
  accession,
  isReviewed,
})

const model = (accession: string, sequence: string): AlphaFoldModel => ({
  accession,
  url: `https://alphafold.example/${accession}.cif`,
  sequence,
})

function host({
  entries = [entry('P11111', true)],
  models = [model('P11111', SHORT)],
  seqs = { short: SHORT, long: LONG },
  taxonId = 9606,
}: {
  entries?: UniProtEntry[] | Error
  taxonId?: number | null
  models?: AlphaFoldModel[] | Error
  seqs?: Record<string, string>
} = {}) {
  const searched: unknown[] = []
  const h: GeneLaunchHost = {
    translate: async transcripts =>
      transcripts.map(feature => ({ feature, seq: seqs[feature.id()] })),
    taxonId: async () => taxonId ?? undefined,
    rankIsoforms: async (isoforms, structureSequences) =>
      rankIsoforms(isoforms, structureSequences),
    searchUniProtEntries: async args => {
      searched.push(args)
      if (entries instanceof Error) {
        throw entries
      }
      return { entries, attemptedCount: 1, failedCount: 0 }
    },
    fetchAlphaFoldModels: async () => {
      if (models instanceof Error) {
        throw models
      }
      return models
    },
  }
  return { host: h, searched }
}

test('a search names an entry only when one hit or one reviewed hit', () => {
  expect(unambiguousEntry([])).toBeUndefined()
  expect(unambiguousEntry([entry('A0A000', false)])?.accession).toBe('A0A000')
  expect(
    unambiguousEntry([entry('A0A000', false), entry('P11111', true)])
      ?.accession,
  ).toBe('P11111')
  expect(
    unambiguousEntry([entry('P11111', true), entry('P22222', true)]),
  ).toBeUndefined()
  expect(
    unambiguousEntry([entry('A0A000', false), entry('A0A001', false)]),
  ).toBeUndefined()
})

test('maps the isoform the AlphaFold model was folded from, not the longest', async () => {
  const { host: h, searched } = host()
  const launch = await resolveGeneLaunch({ host: h, feature: gene() })
  expect(launch.transcript.id()).toBe('short')
  expect(launch.userProvidedTranscriptSequence).toBe(SHORT)
  expect(launch.uniprotId).toBe('P11111')
  expect(launch.url).toBe('https://alphafold.example/P11111.cif')
  expect(searched).toEqual([
    {
      recognizedIds: [],
      geneId: undefined,
      geneName: 'GENE1',
      organismId: 9606,
    },
  ])
})

test('keeps the right-clicked isoform and reads its accession', async () => {
  const { host: h, searched } = host()
  const launch = await resolveGeneLaunch({
    host: h,
    feature: gene({
      subfeatures: [
        transcript('short', { uniprot: 'P11111' }),
        transcript('long', { uniprot: 'P22222' }),
      ],
    }),
    preferredTranscriptId: 'long',
  })
  expect(launch.transcript.id()).toBe('long')
  expect(launch.uniprotId).toBe('P22222')
  expect(searched).toEqual([])
})

test('an ambiguous search resolves the longest isoform and no structure', async () => {
  const { host: h } = host({
    entries: [entry('P11111', true), entry('P22222', true)],
  })
  const launch = await resolveGeneLaunch({ host: h, feature: gene() })
  expect(launch.uniprotId).toBeUndefined()
  expect(launch.url).toBeUndefined()
  expect(launch.transcript.id()).toBe('long')
})

// a gene symbol names a different protein in every species
test('a gene name is not searched on an assembly with no taxon', async () => {
  const { host: h, searched } = host({ taxonId: null })
  const launch = await resolveGeneLaunch({ host: h, feature: gene() })
  expect(searched).toEqual([])
  expect(launch.uniprotId).toBeUndefined()
})

test('an unreachable UniProt leaves the entry unresolved', async () => {
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  const { host: h } = host({ entries: new Error('Failed to fetch') })
  const launch = await resolveGeneLaunch({ host: h, feature: gene() })
  expect(launch.uniprotId).toBeUndefined()
  expect(launch.transcript.id()).toBe('long')
  expect(warn).toHaveBeenCalledOnce()
  warn.mockRestore()
})

test('a caller naming its own structure does not ask UniProt', async () => {
  const { host: h, searched } = host()
  const launch = await resolveGeneLaunch({
    host: h,
    feature: gene(),
    findStructure: false,
  })
  expect(searched).toEqual([])
  expect(launch.url).toBeUndefined()
  expect(launch.userProvidedTranscriptSequence).toBe(LONG)
})

test('an entry AlphaFold has not folded has no url', async () => {
  const { host: h } = host({ models: [] })
  const launch = await resolveGeneLaunch({ host: h, feature: gene() })
  expect(launch.uniprotId).toBe('P11111')
  expect(launch.url).toBeUndefined()
})

test('an unreachable AlphaFold API falls back to the spelled filename', async () => {
  const { host: h } = host({ models: new Error('Failed to fetch') })
  const launch = await resolveGeneLaunch({ host: h, feature: gene() })
  expect(launch.url).toMatch(/AF-P11111-F1/)
})

test('a gene with no translatable transcript throws', async () => {
  const { host: h } = host({ seqs: {} })
  await expect(resolveGeneLaunch({ host: h, feature: gene() })).rejects.toThrow(
    /could be translated/,
  )
})
