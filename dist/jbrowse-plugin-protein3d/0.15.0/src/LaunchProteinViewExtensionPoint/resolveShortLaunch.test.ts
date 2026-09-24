import { SimpleFeature } from '@jbrowse/core/util'
import { expect, test, vi } from 'vitest'

import { resolveShortLaunch } from './resolveShortLaunch'

import type { AbstractSessionModel } from '@jbrowse/core/util'

vi.mock('../LaunchProteinView/utils/calculateProteinSequence', () => ({
  fetchProteinSeq: () => Promise.resolve('MEEPQSDPSV'),
}))

// Ensembl's GFF3 spelling, as the adapter hands it over: the ID carries a type
// prefix and `transcript_id` does not
const ensemblGene = new SimpleFeature({
  uniqueId: 'g1',
  refName: '17',
  start: 100,
  end: 200,
  strand: -1,
  type: 'gene',
  id: 'gene:ENSG00000141510',
  subfeatures: [
    {
      uniqueId: 't1',
      refName: '17',
      start: 100,
      end: 200,
      strand: -1,
      type: 'mRNA',
      id: 'transcript:ENST00000269305',
      name: 'TP53-201',
      transcript_id: 'ENST00000269305',
      subfeatures: [
        {
          uniqueId: 'c1',
          refName: '17',
          start: 120,
          end: 180,
          strand: -1,
          type: 'CDS',
          phase: 0,
        },
      ],
    },
  ],
})

function fakeSession(
  tracks: Record<string, { type: string; uri: string }>,
  featuresByUri: Record<string, SimpleFeature[]>,
) {
  const call = vi.fn(
    (
      _sessionId: string,
      _method: string,
      args: { adapterConfig: { uri: string } },
    ) => Promise.resolve(featuresByUri[args.adapterConfig.uri] ?? []),
  )
  const session = {
    assemblyManager: {
      waitForAssembly: () =>
        Promise.resolve({
          name: 'hg38',
          isValidRefName: (refName: string) => refName === '17',
          getCanonicalRefName: (refName: string) => refName,
        }),
    },
    rpcManager: { call },
    getTrackById: (trackId: string) => {
      const track = tracks[trackId]
      return track
        ? { trackId, type: track.type, adapter: { uri: track.uri } }
        : undefined
    },
  }
  return { session: session as unknown as AbstractSessionModel, call }
}

const connectedView = (tracks: string[]) => ({
  assembly: 'hg38',
  loc: '17:1-1000',
  tracks,
})

test('finds an Ensembl transcript by its transcript_id, version or not', async () => {
  const { session } = fakeSession(
    { ensembl: { type: 'FeatureTrack', uri: 'ensembl.gff3' } },
    { 'ensembl.gff3': [ensemblGene] },
  )
  for (const transcriptId of ['ENST00000269305', 'ENST00000269305.9']) {
    const resolved = await resolveShortLaunch({
      session,
      transcriptId,
      connectedView: connectedView(['ensembl']),
    })
    expect(resolved.feature.transcript_id).toBe('ENST00000269305')
  }
})

test('asks only the feature tracks, and stops at the first that has it', async () => {
  const { session, call } = fakeSession(
    {
      clinvar: { type: 'VariantTrack', uri: 'clinvar.vcf.gz' },
      ensembl: { type: 'FeatureTrack', uri: 'ensembl.gff3' },
      gencode: { type: 'FeatureTrack', uri: 'gencode.gff3' },
    },
    { 'ensembl.gff3': [ensemblGene], 'gencode.gff3': [ensemblGene] },
  )
  await resolveShortLaunch({
    session,
    transcriptId: 'TP53-201',
    connectedView: connectedView(['clinvar', 'ensembl', 'gencode']),
  })
  expect(call.mock.calls.map(([, , args]) => args.adapterConfig.uri)).toEqual([
    'ensembl.gff3',
  ])
})

test('says which tracks it searched when none has the transcript', async () => {
  const { session } = fakeSession(
    { ensembl: { type: 'FeatureTrack', uri: 'ensembl.gff3' } },
    { 'ensembl.gff3': [ensemblGene] },
  )
  await expect(
    resolveShortLaunch({
      session,
      transcriptId: 'NM_000546.6',
      connectedView: connectedView(['ensembl']),
    }),
  ).rejects.toThrow(/"NM_000546.6" not found .*\[ensembl\]/)
})
