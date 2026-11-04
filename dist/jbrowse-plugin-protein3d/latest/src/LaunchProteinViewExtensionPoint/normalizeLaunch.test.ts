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

test('a structure carries the chains and filter it draws', () => {
  const filter = [{ field: 'residue', lte: 184 }]
  const { requested, warnings } = accepted({
    structures: [{ pdbId: '6MEO', chains: ['B'], filter }],
  })
  expect(requested).toMatchObject([{ chains: ['B'], filter }])
  expect(warnings).toEqual([])
  expect(
    accepted({ pdbId: '6MEO', filter: 'residue <= 184' }).warnings,
  ).toEqual([
    "`filter` is not a list of predicates such as [{ field: 'residue', lte: 184 }] and was ignored",
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

test('the view settings a launch names reach it typed', () => {
  const { settings, warnings } = accepted({
    pdbId: '1TUP',
    id: 'structure',
    height: 400,
    showControls: true,
    trackHeight: 12,
    color: { field: 'plddt' },
    colorScheme: 'chain-id',
    alignmentAlgorithm: 'needleman_wunsch',
  })
  expect(warnings).toEqual([])
  expect(settings).toMatchObject({
    id: 'structure',
    height: 400,
    showControls: true,
    trackHeight: 12,
    color: { field: 'plddt' },
    colorScheme: 'chain-id',
    alignmentAlgorithm: 'needleman_wunsch',
  })
})

test('a view setting of the wrong type is dropped by name', () => {
  const { settings, warnings } = accepted({
    pdbId: '1TUP',
    height: '400',
    showControls: 'yes',
  })
  expect(settings.height).toBeUndefined()
  expect(settings.showControls).toBeUndefined()
  expect(warnings).toEqual([
    '`height` is not a number and was ignored',
    '`showControls` is not true or false and was ignored',
  ])
})

// A figure from a gene name and its marks used to need a full snapshot with a
// serialized feature, because the launch dropped these as unknown keys.
test("a figure's layers and camera reach the view from the launch", () => {
  const figure = {
    camera: { position: [0, 0, 50], target: [0, 0, 0], up: [0, 1, 0] },
    surface: { opacity: 0.3 },
    marks: [{ site: 'A:248', mark: 'spheres' }],
    distances: [{ a: 'A:248@NH2', b: 'B:12' }],
    silhouettes: true,
    occlusion: true,
  }
  const { settings, warnings } = accepted({ gene: 'TP53', ...figure })
  expect(warnings).toEqual([])
  expect(settings).toMatchObject(figure)
})

test('a figure layer of the wrong shape is dropped by name', () => {
  const { settings, warnings } = accepted({
    gene: 'TP53',
    camera: { position: [0, 0] },
    marks: 'A:248',
  })
  expect(settings.camera).toBeUndefined()
  expect(settings.marks).toBeUndefined()
  expect(warnings).toEqual([
    '`camera` was ignored: camera.position is three numbers such as [0, 1, 0], not [0,0]; camera.target is three numbers such as [0, 1, 0], not undefined; camera.up is three numbers such as [0, 1, 0], not undefined',
    "`marks` is not a list such as [{ site: 'A:248', mark: 'spheres' }] and was ignored",
  ])
})

// the view refuses these at snapshot time, so a launch that let them through
// failed to open where it could have dropped the layer and opened
test('a camera or surface the view would refuse is dropped with its reason', () => {
  const { settings, warnings } = accepted({
    gene: 'TP53',
    camera: {
      position: [0, 0, 50],
      target: [0, 0, 0],
      up: [0, 1, 0],
      radius: 0,
    },
    surface: { opacity: 1.5 },
  })
  expect(settings.camera).toBeUndefined()
  expect(settings.surface).toBeUndefined()
  expect(warnings).toEqual([
    '`camera` was ignored: camera.radius is a positive number, not 0',
    '`surface` was ignored: surface.opacity is a number from 0 to 1, not 1.5',
  ])
})

test('an unknown key of the launch is reported', () => {
  expect(
    accepted({
      pdbId: '1TUP',
      hieght: 400,
      gene: 'TP53',
      transcriptId: 'NM_000546',
      connectedView: {},
      sideBySide: false,
      feature: {},
      connectedViewId: 'genome',
    }).warnings,
  ).toEqual(['ignored unknown key(s): hieght'])
  expect(rejected({ colour: 'red' }).warnings).toEqual([
    'ignored unknown key(s): colour',
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

// read raw, these failed far from the spec: `tracks.map is not a function`,
// `gene.toLowerCase is not a function`, an MST snapshot error
test('a linkage key of the wrong type is dropped by name', () => {
  const { linkage, warnings } = accepted({
    pdbId: '1TUP',
    gene: 7157,
    transcriptId: 'ENST00000269305',
    connectedView: { tracks: 'genes' },
    connectedViewId: 5,
    sideBySide: 'yes',
  })
  expect(linkage).toMatchObject({
    gene: undefined,
    transcriptId: 'ENST00000269305',
    connectedView: undefined,
    connectedViewId: undefined,
    sideBySide: undefined,
  })
  expect(warnings).toEqual([
    '`gene` is not a string and was ignored',
    '`connectedView` is not { assembly, loc, tracks } and was ignored',
    '`connectedViewId` is not a string and was ignored',
    '`sideBySide` is not true or false and was ignored',
  ])
})

test('a variant parses onto the linkage', () => {
  const { linkage, warnings } = accepted({
    gene: 'TP53',
    variant: 'chr17:7674220 C>T',
  })
  expect(warnings).toEqual([])
  expect(linkage.variant).toEqual({
    text: 'chr17:7674220 C>T',
    refName: 'chr17',
    start: 7674219,
    change: { ref: 'C', alt: 'T' },
  })
})

test('a variant that does not parse refuses the launch', () => {
  expect(rejected({ gene: 'TP53', variant: 'R248Q' }).error).toBe(
    "`variant` \"R248Q\" is not a genome position or substitution such as 'chr17:7674220 C>T' or 'chr17:7674220'",
  )
})

test('a variant of the wrong type is reported and left out', () => {
  const { linkage, warnings } = accepted({ gene: 'TP53', variant: 7674220 })
  expect(linkage.variant).toBeUndefined()
  expect(warnings).toEqual([
    "`variant` is not a string such as 'chr17:7674220 C>T' or 'chr17:7674220' and was ignored",
  ])
})
