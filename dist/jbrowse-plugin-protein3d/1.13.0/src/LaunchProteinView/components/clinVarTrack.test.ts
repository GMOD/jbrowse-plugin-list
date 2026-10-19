import { expect, test } from 'vitest'

import { clinVarTrackConf, clinVarTrackFeatures } from './clinVarTrack'

const r248q = {
  variant: {
    start: 7674220,
    ref: 'C',
    alt: 'T',
    id: '12356',
    significance: ['Pathogenic'],
  },
  residue: 247,
  from: 'R',
  to: 'Q',
}
const r248w = {
  variant: {
    start: 7674221,
    ref: 'G',
    alt: 'A',
    id: '12357',
    significance: ['Pathogenic/Likely_pathogenic'],
  },
  residue: 247,
  from: 'R',
  to: 'W',
}
const p72r = {
  variant: {
    start: 7676154,
    ref: 'G',
    alt: 'C',
    id: undefined,
    significance: ['Benign'],
  },
  residue: 71,
  from: 'P',
  to: 'R',
}

test('one feature per variant on the entry residue, named by the entry numbering', () => {
  const features = clinVarTrackFeatures({
    placed: [r248w, r248q, p72r],
    uniprotId: 'P04637',
    toEntryPosition: residue => residue,
  })
  expect(features.map(f => f.name)).toEqual(['P72R', 'R248Q', 'R248W'])
  expect(features[1]).toEqual({
    uniqueId: 'clinvar-12356-1',
    refName: 'P04637',
    start: 247,
    end: 248,
    name: 'R248Q',
    type: 'missense_variant',
    category: 'pathogenic',
    significance: 'Pathogenic',
    clinvarId: '12356',
  })
  expect(features[0]).toMatchObject({
    uniqueId: 'clinvar-7676154C-2',
    category: 'benign',
    significance: 'Benign',
  })
  expect(features[0]).not.toHaveProperty('clinvarId')
})

// TP53's Δ133 isoform begins at the entry's residue 133, so its residue 116
// is the entry's 248, and a variant the isoform does not share with the
// entry has no residue to land on
test('an isoform transcript places its residues where the entry numbers them, or nowhere', () => {
  const features = clinVarTrackFeatures({
    placed: [
      { ...r248q, residue: 115 },
      { ...p72r, residue: 3 },
    ],
    uniprotId: 'P04637',
    toEntryPosition: residue => (residue === 115 ? 247 : undefined),
  })
  expect(features).toHaveLength(1)
  expect(features[0]).toMatchObject({
    name: 'R248Q',
    start: 247,
    transcriptChange: 'R116Q',
  })
})

test('the track carries its features inline, colored by category', () => {
  const features = clinVarTrackFeatures({
    placed: [r248q],
    uniprotId: 'P04637',
    toEntryPosition: residue => residue,
  })
  expect(
    clinVarTrackConf({
      uniprotId: 'P04637',
      idPrefix: 'view1-P04637',
      features,
    }),
  ).toEqual({
    type: 'FeatureTrack',
    trackId: 'view1-P04637-ClinVar',
    name: 'ClinVar',
    assemblyNames: ['P04637'],
    adapter: {
      type: 'FromConfigAdapter',
      adapterId: 'view1-P04637-ClinVar',
      features,
    },
    displays: [
      {
        type: 'LinearBasicDisplay',
        displayId: 'view1-P04637-ClinVar-LinearBasicDisplay',
        color: {
          field: 'category',
          scale: 'categorical',
          domain: [
            'pathogenic',
            'likely pathogenic',
            'conflicting',
            'uncertain',
            'likely benign',
            'benign',
            'other',
          ],
          range: [
            '#a50f15',
            '#de2d26',
            '#fd8d3c',
            '#969696',
            '#74c476',
            '#238b45',
            '#bdbdbd',
          ],
          labels: [
            'Pathogenic',
            'Likely pathogenic',
            'Conflicting',
            'Uncertain significance',
            'Likely benign',
            'Benign',
            'Other',
          ],
          title: 'ClinVar classification',
        },
      },
    ],
  })
})
