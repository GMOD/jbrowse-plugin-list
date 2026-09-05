import { expect, test } from 'vitest'

import { proteinViewSnapshot } from './proteinViewSpec'

test('emits a flat top-level snapshot with view props alongside structures', () => {
  const snap = proteinViewSnapshot({
    displayName: 'Protein view',
    height: 500,
    zoomToBaseLevel: false,
    connectedMsaViewId: 'msa-1',
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
    connectedMsaViewId: 'msa-1',
  })
  expect(snap.structures[0]).toMatchObject({
    url: 'https://example.com/AF-P04637.cif',
    connectedViewId: 'lgv-1',
    userProvidedTranscriptSequence: 'MEEP',
  })
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
