import { expect, test } from 'vitest'

import { decideAlignment } from './alignmentDecision'

import type { AlignmentState } from './alignmentDecision'
import type { Entity, PairwiseAlignment } from 'p2s_mapper'

const DNA: Entity = {
  entityId: '1',
  seq: 'ACGTACGT',
  seqIds: [1, 2, 3, 4, 5, 6, 7, 8],
  chains: ['E'],
  nucleicAcid: true,
}
const PROTEIN: Entity = {
  entityId: '2',
  seq: 'MKAAQRST',
  seqIds: [1, 2, 3, 4, 5, 6, 7, 8],
  chains: ['A'],
}
const PARALOG: Entity = {
  entityId: '3',
  seq: 'MKAGQRST',
  seqIds: [1, 2, 3, 4, 5, 6, 7, 8],
  chains: ['B'],
}

const alignmentTo = (structureRow: string): PairwiseAlignment => ({
  consensus: '',
  alns: [
    { id: 'transcript', seq: 'MKAAQRST' },
    { id: 'structure', seq: structureRow },
  ],
})

function state(overrides: Partial<AlignmentState>): AlignmentState {
  return {
    userProvidedTranscriptSequence: 'MKAAQRST',
    entities: [DNA, PROTEIN, PARALOG],
    pairwiseAlignment: undefined,
    alignmentImported: false,
    mappedEntityId: undefined,
    ...overrides,
  }
}

test('nothing to align without a transcript or entities', () => {
  for (const s of [
    state({ userProvidedTranscriptSequence: '' }),
    state({ entities: undefined }),
    state({ entities: [] }),
  ]) {
    expect(decideAlignment(s)).toEqual({ kind: 'nothingToAlign' })
  }
})

test('keeps an alignment computed here, whatever chain is stored', () => {
  expect(
    decideAlignment(
      state({
        pairwiseAlignment: alignmentTo('XXXXXXXX'),
        mappedEntityId: '1',
      }),
    ),
  ).toEqual({ kind: 'keep' })
})

test('an imported alignment adopts the chain it spells', () => {
  expect(
    decideAlignment(
      state({
        pairwiseAlignment: alignmentTo('MKAGQRST'),
        alignmentImported: true,
        mappedEntityId: '2',
      }),
    ),
  ).toEqual({ kind: 'adopt', entityId: '3' })
})

test('an imported alignment spelling no chain realigns against the stored protein chain', () => {
  const decision = decideAlignment(
    state({
      pairwiseAlignment: alignmentTo('MKAAWRST'),
      alignmentImported: true,
      mappedEntityId: '3',
    }),
  )
  expect(decision).toMatchObject({
    kind: 'realign',
    transcript: 'MKAAQRST',
    entity: PARALOG,
    identical: false,
  })
  expect(decision).toHaveProperty(
    'problem',
    expect.stringContaining('is not the sequence of any chain'),
  )
})

test('a realignment against a chain that spells the transcript is free', () => {
  expect(
    decideAlignment(
      state({
        pairwiseAlignment: alignmentTo('MKAAWRST'),
        alignmentImported: true,
        mappedEntityId: '2',
      }),
    ),
  ).toMatchObject({ kind: 'realign', entity: PROTEIN, identical: true })
})

test('an imported alignment spelling no chain is discarded when the stored chain is no protein', () => {
  for (const mappedEntityId of ['1', '9', undefined]) {
    expect(
      decideAlignment(
        state({
          pairwiseAlignment: alignmentTo('MKAAWRST'),
          alignmentImported: true,
          mappedEntityId,
        }),
      ),
    ).toMatchObject({ kind: 'discard' })
  }
})

test('with no alignment, chooses a chain, at once when a protein chain spells the transcript', () => {
  expect(decideAlignment(state({}))).toEqual({
    kind: 'choose',
    transcript: 'MKAAQRST',
    entities: [DNA, PROTEIN, PARALOG],
    identical: true,
  })
  expect(decideAlignment(state({ entities: [DNA, PARALOG] }))).toMatchObject({
    kind: 'choose',
    identical: false,
  })
})

test('a nucleic-acid chain spelling the transcript does not make the choice free', () => {
  expect(
    decideAlignment(
      state({ userProvidedTranscriptSequence: 'ACGTACGT', entities: [DNA] }),
    ),
  ).toMatchObject({ kind: 'choose', identical: false })
})

test('reads no field its branch does not need, so an autorun tracks none', () => {
  const computedHere = {
    ...state({ pairwiseAlignment: alignmentTo('MKAAQRST') }),
    get mappedEntityId(): string | undefined {
      throw new Error('read mappedEntityId')
    },
  }
  expect(decideAlignment(computedHere)).toEqual({ kind: 'keep' })
  const noTranscript = {
    ...state({ userProvidedTranscriptSequence: '' }),
    get alignmentImported(): boolean {
      throw new Error('read alignmentImported')
    },
  }
  expect(decideAlignment(noTranscript)).toEqual({ kind: 'nothingToAlign' })
})
