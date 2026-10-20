import { expect, test } from 'vitest'

import { proteinTrackConfs } from './proteinTrackSetup'
import { cssScaleOf } from '../../ProteinView/colorScale'
import { UNIPROT_FEATURE_COLOR } from '../../ProteinView/uniprotFeatureTypes'

const GFF = 'https://rest.uniprot.org/uniprotkb/P04637.gff'

const alphaMissense = {
  type: 'MultiQuantitativeTrack',
  trackId: 'P04637-AlphaMissense-scores',
  name: 'AlphaMissense scores',
  assemblyNames: ['P04637'],
  adapter: {
    type: 'AlphaMissensePathogenicityAdapter',
    location: {
      uri: 'https://alphafold.ebi.ac.uk/files/AF-P04637-F1-aa-substitutions.csv',
    },
  },
  displays: [
    {
      type: 'LinearWiggleDisplay',
      displayId: 'P04637-AlphaMissense-scores-LinearWiggleDisplay',
      defaultRendering: 'density',
      color: {
        field: 'score',
        scale: 'linear',
        range: ['#2c7bb6', '#ffffff', '#d7191c'],
        domainMid: 0.5,
        title: 'AlphaMissense pathogenicity',
      },
    },
  ],
}

const antigen = {
  type: 'FeatureTrack',
  trackId: 'P04637-Antigen',
  name: 'Antigen',
  adapter: {
    type: 'Gff3Adapter',
    gffLocation: {
      uri: 'https://www.ebi.ac.uk/proteins/api/antigen/P04637?format=gff',
    },
  },
  assemblyNames: ['P04637'],
}

function featureTrack(height: number) {
  return {
    type: 'FeatureTrack',
    trackId: 'P04637-UniProt-features',
    name: 'UniProt features',
    adapter: { type: 'Gff3Adapter', gffLocation: { uri: GFF } },
    assemblyNames: ['P04637'],
    displays: [
      {
        displayId: 'P04637-UniProt-features-LinearBasicDisplay',
        type: 'LinearBasicDisplay',
        color: UNIPROT_FEATURE_COLOR,
        facet: { field: 'type', domain: UNIPROT_FEATURE_COLOR.domain },
        height,
      },
    ],
  }
}

test('prefixed by the accession, the configs are the ones the session used to hold', () => {
  expect(
    proteinTrackConfs({
      uniprotId: 'P04637',
      featureTypes: ['Chain', 'DNA binding'],
      confidenceUrl: 'https://example.org/confidence.json',
      idPrefix: 'P04637',
    }),
  ).toEqual([
    featureTrack(112),
    antigen,
    {
      type: 'QuantitativeTrack',
      trackId: 'P04637-AlphaFold-confidence',
      name: 'AlphaFold confidence',
      adapter: {
        type: 'AlphaFoldConfidenceAdapter',
        location: { uri: 'https://example.org/confidence.json' },
      },
      assemblyNames: ['P04637'],
      displays: [
        {
          type: 'LinearWiggleDisplay',
          displayId: 'P04637-AlphaFold-confidence-LinearWiggleDisplay',
          color: {
            field: 'score',
            scale: 'threshold',
            domain: [50, 70, 90],
            range: ['#ff7d45', '#ffdb13', '#65cbf3', '#0053d6'],
            labels: [
              'very low <50',
              'low 50-70',
              'confident 70-90',
              'very high >90',
            ],
            title: 'AlphaFold per-residue confidence (pLDDT)',
          },
        },
      ],
    },
    alphaMissense,
  ])
})

test('an entry with no confidence url gets no confidence track', () => {
  expect(
    proteinTrackConfs({
      uniprotId: 'P04637',
      featureTypes: [],
      confidenceUrl: undefined,
      idPrefix: 'P04637',
    }),
  ).toEqual([featureTrack(60), antigen, alphaMissense])
})

// TP53's fifteen types drew nineteen GPU tracks, three past the page's
// WebGL2 contexts, and the page wedged blank
test('every feature type is a section of one track, ordered and colored by one object', () => {
  const [features] = proteinTrackConfs({
    uniprotId: 'P04637',
    featureTypes: ['Turn', 'Novel type', 'Chain', 'Domain', 'Another type'],
    confidenceUrl: undefined,
    idPrefix: 'P04637',
  })
  expect(features).toEqual(featureTrack(190))
})

// The 3D bars colored Zinc finger red and Region green while the 1D track,
// which named no color, painted every type the host's default
test("the 1D track paints a type the 3D bar's color, and an unlisted one grey", () => {
  const [features] = proteinTrackConfs({
    uniprotId: 'P04637',
    featureTypes: [],
    confidenceUrl: undefined,
    idPrefix: 'P04637',
  })
  const display = (
    features?.displays as { color: typeof UNIPROT_FEATURE_COLOR }[]
  )[0]!
  const paint = cssScaleOf(display.color)
  expect(paint('Zinc finger')).toBe('#d62728')
  expect(paint('Region')).toBe('#2ca02c')
  expect(paint('Novel type')).toBe('#999999')
})

test('the prefix reaches every track and display id, and nothing else', () => {
  const args = {
    uniprotId: 'P04637',
    featureTypes: ['Chain'],
    confidenceUrl: 'https://example.org/confidence.json',
  }
  const plain = proteinTrackConfs({ ...args, idPrefix: 'P04637' })
  const prefixed = proteinTrackConfs({ ...args, idPrefix: 'view1-P04637' })
  const ids = JSON.stringify(prefixed).match(/"(trackId|displayId)":"[^"]+"/g)
  expect(ids).toHaveLength(7)
  expect(ids?.every(id => id.includes(':"view1-P04637-'))).toBe(true)
  expect(
    JSON.parse(
      JSON.stringify(prefixed).replaceAll(
        /"(trackId|displayId)":"view1-/g,
        '"$1":"',
      ),
    ),
  ).toEqual(plain)
})
