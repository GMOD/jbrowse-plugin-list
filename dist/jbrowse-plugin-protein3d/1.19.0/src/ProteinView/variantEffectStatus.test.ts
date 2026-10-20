import { identityUniProtPositionMap, makeCoordinateMapper } from 'p2s_mapper'
import { expect, test } from 'vitest'

import { alphaMissenseAsk, clinVarAsk } from './variantEffectSource'
import { variantEffectStatus } from './variantEffectStatus'
import { VariantEffectRefusal } from './variantEffects'

import type { VariantEffectAsk } from './variantEffectLoader'
import type { VariantEffectValues } from './variantEffects'

const feature = {
  uniqueId: 'tx1',
  refName: 'chr17',
  start: 100,
  end: 400,
  strand: -1,
  name: 'NM_000546.6',
}

const clinVar = clinVarAsk({
  feature,
  assemblyName: 'hg38',
  assemblyNames: ['hg38', 'GRCh38'],
})

function requestKey(ask: VariantEffectAsk) {
  return ask.status === 'ready' ? ask.request.key : ''
}

// a structure missing the transcript's third residue and carrying a tag the
// transcript lacks
const alignment = makeCoordinateMapper({
  consensus: ' || ||',
  alns: [
    { id: 'transcript', seq: '-MKVAL' },
    { id: 'structure', seq: 'GMK-AL' },
  ],
})

const structure = {
  entity: { entityId: '2', seq: 'GMKAL', seqIds: [11, 12, 13, 14, 15] },
  pdbId: '9XYZ',
  mapUniProtPosition: identityUniProtPositionMap,
  transcriptToStructure: alignment.maps.transcriptSeqToStructureSeqPosition,
}

function answered(ask: VariantEffectAsk, values: VariantEffectValues) {
  return variantEffectStatus({
    ...structure,
    ask,
    state: { key: requestKey(ask), values },
  })
}

test('places transcript residues through the alignment, skipping its gaps', () => {
  const status = answered(clinVar, {
    numbering: 'transcript',
    byPosition: new Map([
      [0, 1],
      [1, 0],
      [2, 3],
      [3, 2],
      [4, 0],
    ]),
  })
  expect(status).toEqual({
    pending: false,
    placed: {
      entityId: '2',
      byLabelSeqId: new Map([
        [12, 1],
        [13, 0],
        [14, 2],
        [15, 0],
      ]),
    },
  })
})

test('a transcript-numbered answer waits for the alignment to place', () => {
  const status = variantEffectStatus({
    ...structure,
    transcriptToStructure: undefined,
    ask: clinVar,
    state: {
      key: requestKey(clinVar),
      values: { numbering: 'transcript', byPosition: new Map([[0, 1]]) },
    },
  })
  expect(status).toEqual({ pending: false, placed: undefined })
})

test('pending until the answer to the current request arrives', () => {
  expect(
    variantEffectStatus({ ...structure, ask: clinVar, state: undefined }),
  ).toEqual({ pending: true })
  // an answer to another transcript is not this one's
  expect(
    variantEffectStatus({
      ...structure,
      ask: clinVar,
      state: {
        key: 'clinvar:GRCh38:hg38:chr7:1-2:tx9',
        values: { numbering: 'transcript', byPosition: new Map() },
      },
    }),
  ).toEqual({ pending: true })
  expect(
    variantEffectStatus({
      ...structure,
      ask: { status: 'waiting' },
      state: undefined,
    }),
  ).toEqual({ pending: true, message: undefined })
})

test('says why a structure stays grey', () => {
  expect(
    variantEffectStatus({
      ...structure,
      ask: clinVarAsk({
        feature: undefined,
        assemblyName: 'hg38',
        assemblyNames: [],
      }),
      state: undefined,
    }),
  ).toEqual({
    pending: false,
    message: 'No transcript to place ClinVar variants on',
  })
  expect(
    clinVarAsk({ feature, assemblyName: 'mm39', assemblyNames: ['mm39'] }),
  ).toEqual({
    status: 'unavailable',
    reason: 'NCBI publishes ClinVar variants on GRCh38 and GRCh37, not mm39',
  })
  expect(
    variantEffectStatus({
      ...structure,
      ask: clinVar,
      state: { key: requestKey(clinVar), error: new Error('HTTP 503') },
    }).message,
  ).toBe('Could not fetch ClinVar variants for NM_000546.6: HTTP 503')
})

test('asks GRCh37 for an hg19 transcript, keyed apart from GRCh38', () => {
  const hg19 = clinVarAsk({
    feature,
    assemblyName: 'hg19',
    assemblyNames: ['hg19', 'GRCh37'],
  })
  expect(hg19.status === 'ready' && hg19.request).toMatchObject({
    scheme: 'clinvar',
    build: 'GRCh37',
    assemblyName: 'hg19',
  })
  expect(requestKey(hg19)).not.toBe(requestKey(clinVar))
})

test('an AlphaFold model whose chain spells another sequence stays grey', () => {
  const ask = alphaMissenseAsk({ uniprotId: 'P0OLD1', isLoading: false })
  const values: VariantEffectValues = {
    numbering: 'uniprot',
    sequence: 'MKVAL',
    byPosition: new Map([[1, 0.5]]),
  }
  expect(
    variantEffectStatus({
      ...structure,
      pdbId: undefined,
      entity: { entityId: '1', seq: 'MKVA', seqIds: [1, 2, 3, 4] },
      ask,
      state: { key: requestKey(ask), values },
    }),
  ).toEqual({
    pending: false,
    message:
      "AlphaMissense scores for P0OLD1 number a sequence that differs from this model's",
  })
})

test('a refusal reads as its own message, not as a failed fetch', () => {
  const message =
    "ClinVar's REF disagrees with this assembly's sequence at 40 of 50 variants; is the assembly GRCh38?"
  expect(
    variantEffectStatus({
      ...structure,
      ask: clinVar,
      state: {
        key: requestKey(clinVar),
        error: new VariantEffectRefusal(message),
      },
    }),
  ).toEqual({ pending: false, message })
})

test('a transcript with no genome view, or on hg19 chrM, asks nothing', () => {
  expect(
    clinVarAsk({ feature, assemblyName: undefined, assemblyNames: [] }),
  ).toEqual({
    status: 'unavailable',
    reason: 'No genome view to read ClinVar variants on',
  })
  const mitochondrial = { ...feature, refName: 'chrM' }
  expect(
    clinVarAsk({
      feature: mitochondrial,
      assemblyName: 'hg19',
      assemblyNames: ['hg19'],
    }),
  ).toEqual({
    status: 'unavailable',
    reason:
      "hg19's chrM is NC_001807, not the rCRS mitochondrion ClinVar's GRCh37 VCF numbers",
  })
  expect(
    clinVarAsk({
      feature: mitochondrial,
      assemblyName: 'hg38',
      assemblyNames: ['hg38'],
    }).status,
  ).toBe('ready')
})
