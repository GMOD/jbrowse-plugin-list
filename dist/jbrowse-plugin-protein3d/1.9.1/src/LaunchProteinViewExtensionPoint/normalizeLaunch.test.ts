import { expect, test } from 'vitest'

import { STRUCTURE_KEYS, normalizeLaunch } from './normalizeLaunch'

const alignment = {
  consensus: '|| ',
  alns: [
    { id: 'transcript', seq: 'MEE' },
    { id: 'structure', seq: 'ME-' },
  ],
}

function accepted(launch: object) {
  const normalized = normalizeLaunch(launch)
  if ('error' in normalized) {
    throw new Error(normalized.error)
  }
  return normalized
}

function rejected(launch: object) {
  const normalized = normalizeLaunch(launch)
  if (!('error' in normalized)) {
    throw new Error('the launch was accepted')
  }
  return normalized
}

test('a structure keeps every field it carries, with its url resolved', () => {
  const { requested, warnings } = accepted({
    structures: [
      { pdbId: '1TUP' },
      {
        pdbId: '1YCR',
        hidden: true,
        mappedEntityId: '2',
        pairwiseAlignment: alignment,
        alignmentImported: false,
        initialResidues: { start: 248, end: 248 },
      },
    ],
  })
  expect(warnings).toEqual([])
  expect(requested).toMatchObject([
    { url: 'https://files.rcsb.org/download/1TUP.cif' },
    {
      url: 'https://files.rcsb.org/download/1YCR.cif',
      hidden: true,
      mappedEntityId: '2',
      pairwiseAlignment: alignment,
      alignmentImported: false,
      initialResidues: { start: 248, end: 248 },
    },
  ])
})

test('a value the structure model would throw on is dropped by name', () => {
  const { requested, warnings } = accepted({
    structures: [
      { pdbId: '1TUP' },
      {
        pdbId: '1YCR',
        hidden: 'yes',
        mappedEntityId: 2,
        pairwiseAlignment: { alns: [{ id: 'transcript', seq: 'MEE' }] },
      },
    ],
  })
  expect(requested[1]).toMatchObject({
    url: 'https://files.rcsb.org/download/1YCR.cif',
    hidden: undefined,
    mappedEntityId: undefined,
    pairwiseAlignment: undefined,
  })
  expect(warnings).toEqual([
    '`structures[1].mappedEntityId` is not a string and was ignored',
    '`structures[1].pairwiseAlignment` is not { consensus, alns: [{ id, seq }, { id, seq }] } and was ignored',
    '`structures[1].hidden` is not true or false and was ignored',
  ])
})

test('every structure key written on the launch reaches its one structure', () => {
  const shorthand = {
    pdbId: '1TUP',
    mappedEntityId: '3',
    pairwiseAlignment: alignment,
    alignmentImported: true,
    hidden: true,
    initialSelection: { start: 0, end: 5 },
    initialResidues: [{ start: 248, end: 248 }],
    initialTranscriptResidues: { start: 100, end: 110 },
  }
  const { requested, warnings } = accepted(shorthand)
  expect(warnings).toEqual([])
  expect(requested).toMatchObject([
    { ...shorthand, url: 'https://files.rcsb.org/download/1TUP.cif' },
  ])
})

test('inline data alone names a structure', () => {
  const { requested } = accepted({ data: 'data_1TUP\n' })
  expect(requested).toMatchObject([{ data: 'data_1TUP\n', url: undefined }])
})

test('the launch-wide defaults stay off the shorthand structure', () => {
  const { requested, warnings } = accepted({
    uniprotId: 'P04637',
    feature: { uniqueId: 't1' },
    userProvidedTranscriptSequence: 'MEE',
    connectedViewId: 'lgv',
  })
  expect(warnings).toEqual([])
  expect(requested[0]).toMatchObject({
    uniprotId: 'P04637',
    feature: undefined,
    userProvidedTranscriptSequence: undefined,
    connectedViewId: undefined,
  })
})

test('a structure key beside structures is reported, a shared default is not', () => {
  const { requested, warnings } = accepted({
    structures: [{ uniprotId: 'P04637' }],
    pdbId: '1TUP',
    hidden: true,
    initialResidues: { start: 248, end: 248 },
    feature: { uniqueId: 't1' },
    userProvidedTranscriptSequence: 'MEE',
    connectedViewId: 'lgv',
  })
  expect(requested).toMatchObject([
    { uniprotId: 'P04637', initialResidues: undefined, hidden: undefined },
  ])
  expect(warnings).toEqual([
    '`pdbId` beside `structures` names no structure; add it as an entry of `structures`',
    '`initialResidues` beside `structures` applies to no structure; put it on the one it selects in',
    '`hidden` beside `structures` applies to no structure; put it on the one it describes',
  ])
})

test('a uniprotId beside structures is reported unless it steers a gene lookup', () => {
  const structures = [{ pdbId: '1TUP' }]
  expect(accepted({ structures, uniprotId: 'P04637' }).warnings).toEqual([
    '`uniprotId` beside `structures` names no structure; add it as an entry of `structures`',
  ])
  expect(
    accepted({ structures, uniprotId: 'P04637', gene: 'TP53' }).warnings,
  ).toEqual([])
  expect(
    accepted({
      structures,
      uniprotId: 'P04637',
      gene: 'TP53',
      userProvidedTranscriptSequence: 'MEE',
    }).warnings,
  ).toHaveLength(1)
})

test('an unknown key of a structure is reported and dropped', () => {
  const { requested, warnings } = accepted({
    structures: [{ pdbId: '1TUP' }, { pdbId: '1YCR', hiden: true, colour: 1 }],
  })
  expect(warnings).toEqual([
    'structures[1] ignored unknown key(s): hiden, colour',
  ])
  expect(Object.keys(requested[1] ?? {}).sort()).toEqual(
    [...STRUCTURE_KEYS].sort(),
  )
})

test('a structure naming no source is omitted and the rest still launch', () => {
  const { requested, warnings } = accepted({
    structures: [{ pdbId: '1TUP' }, { ulr: 'https://example.org/a.cif' }, 5],
  })
  expect(requested).toHaveLength(1)
  expect(warnings).toEqual([
    'structures[1] ignored unknown key(s): ulr',
    'structures[1] names no url, data, uniprotId or pdbId and was omitted',
    'structures[2] is not an object and was omitted',
  ])
})

test('a launch left with no structure is rejected, with what it dropped', () => {
  expect(rejected({}).error).toMatch(/No url, data, uniprotId, pdbId or gene/)
  const none = rejected({ structures: [{ ulr: 'https://example.org/a.cif' }] })
  expect(none.error).toMatch(/no entry of `structures` names/)
  expect(none.warnings).toHaveLength(2)
  expect(
    rejected({ gene: 'TP53', userProvidedTranscriptSequence: 'MEE' }).error,
  ).toMatch(/`gene` is not looked up beside `userProvidedTranscriptSequence`/)
})

test('a gene supplies the model a launch does not name', () => {
  const alone = accepted({
    gene: 'TP53',
    initialTranscriptResidues: { start: 100, end: 110 },
  })
  expect(alone.geneModel).toBe('required')
  expect(alone.requested).toMatchObject([
    { initialTranscriptResidues: { start: 100, end: 110 } },
  ])
  expect(accepted({ gene: 'TP53', structures: [{}] }).geneModel).toBe(
    'required',
  )
  expect(accepted({ gene: 'TP53', uniprotId: 'P04637' }).geneModel).toBe(
    'preferred',
  )
  for (const named of [
    { pdbId: '1TUP' },
    { url: 'https://example.org/a.cif' },
    { data: 'data_1TUP\n' },
    { uniprotId: 'P04637', url: 'https://example.org/a.cif' },
    { structures: [{ uniprotId: 'P04637' }] },
  ]) {
    expect(accepted({ gene: 'TP53', ...named }).geneModel).toBeUndefined()
  }
})

test('two sources on one structure keep their precedence and say nothing', () => {
  const { requested, warnings } = accepted({
    structures: [
      { url: 'https://example.org/a.cif', pdbId: '1TUP' },
      { uniprotId: 'P04637', pdbId: '1TUP' },
    ],
  })
  expect(warnings).toEqual([])
  expect(requested).toMatchObject([
    { url: 'https://example.org/a.cif' },
    { uniprotId: 'P04637', url: undefined },
  ])
})

test('a malformed selection is dropped by name', () => {
  const { requested, warnings } = accepted({
    pdbId: '1TUP',
    initialResidues: '248',
  })
  expect(requested[0]?.initialResidues).toBeUndefined()
  expect(warnings).toEqual([
    '`initialResidues` is not { start, end } numbers or an array of them and was ignored',
  ])
})
