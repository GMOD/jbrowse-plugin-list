import { expect, test } from 'vitest'

import { defaultDisplayName, proteinViewSnapshot } from './proteinViewSpec'

test('emits a flat top-level snapshot with view props alongside structures', () => {
  const snap = proteinViewSnapshot({
    displayName: 'Protein view',
    height: 500,
    zoomToBaseLevel: false,
    structures: [
      {
        url: 'https://example.com/AF-P04637.cif',
        connectedViewId: 'lgv-1',
        userProvidedTranscriptSequence: 'MEEP',
      },
    ],
  })

  expect(snap).toMatchObject({
    type: 'ProteinView',
    displayName: 'Protein view',
    height: 500,
    zoomToBaseLevel: false,
  })
  expect(snap.structures[0]).toMatchObject({
    url: 'https://example.com/AF-P04637.cif',
    connectedViewId: 'lgv-1',
    userProvidedTranscriptSequence: 'MEEP',
  })
})

test('a launch whose mark or distance names a structure it lacks is refused', () => {
  const structures = [{ url: 'a.cif' }, { url: 'b.cif' }]
  expect(
    proteinViewSnapshot({
      structures,
      marks: [{ site: 'A:1', structure: 1 }],
    }).marks,
  ).toEqual([{ site: 'A:1', structure: 1 }])
  expect(() =>
    proteinViewSnapshot({
      structures,
      distances: [{ a: 'A:1', b: 'A:2', structure: 2 }],
    }),
  ).toThrow(
    "distances[0].structure is the index of one of the view's 2 structures, not 2",
  )
})

test('defaults a missing userProvidedTranscriptSequence to empty string', () => {
  const snap = proteinViewSnapshot({
    structures: [{ url: 'https://example.com/1CRN.cif' }],
  })
  expect(snap.structures[0]!.userProvidedTranscriptSequence).toBe('')
})

test('passes per-structure feature and initialSelection through unchanged', () => {
  const feature = { uniqueId: 'tx1', refName: 'chr1', start: 0, end: 9 }
  const snap = proteinViewSnapshot({
    structures: [{ url: 'u', feature, initialSelection: { start: 3, end: 7 } }],
  })
  expect(snap.structures[0]!.feature).toBe(feature)
  expect(snap.structures[0]!.initialSelection).toEqual({ start: 3, end: 7 })
})

test('a view with no name is titled by its transcript and structures', () => {
  expect(
    defaultDisplayName([
      {
        pdbId: '1tup',
        feature: {
          uniqueId: 'tx',
          refName: 'chr17',
          start: 0,
          end: 9,
          name: 'TP53',
        },
      },
      { uniprotId: 'P02340' },
    ]),
  ).toBe('Protein view - TP53 - 1TUP - AlphaFold P02340')
  expect(defaultDisplayName([{ data: 'ATOM' }])).toBe(
    'Protein view - Uploaded structure',
  )
  expect(defaultDisplayName([{ data: 'ATOM', fileName: 'kras.pdb' }])).toBe(
    'Protein view - kras.pdb',
  )
  expect(defaultDisplayName([{ pdbId: '1YCR', fileName: 'x.cif' }])).toBe(
    'Protein view - 1YCR',
  )
  expect(defaultDisplayName([])).toBe('Protein view')
})
