import { expect, test } from 'vitest'

import { proteinTrackConfs } from './proteinTrackSetup'

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

const variation = {
  type: 'FeatureTrack',
  trackId: 'P04637-Variation',
  name: 'Variation',
  adapter: {
    type: 'UniProtVariationAdapter',
    location: {
      uri: 'https://www.ebi.ac.uk/proteins/api/variation/P04637.json',
    },
  },
  assemblyNames: ['P04637'],
}

function featureTrack(type: string) {
  return {
    type: 'FeatureTrack',
    trackId: `P04637-${type}`,
    name: type,
    adapter: { type: 'Gff3Adapter', gffLocation: { uri: GFF } },
    assemblyNames: ['P04637'],
    displays: [
      {
        displayId: `P04637-${type}-LinearBasicDisplay`,
        type: 'LinearBasicDisplay',
        jexlFilters: [`get(feature,'type')=='${type}'`],
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
    featureTrack('Chain'),
    featureTrack('DNA binding'),
    antigen,
    variation,
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
            domain: [50.000001, 70.000001, 90.000001],
            range: ['#ff7d45', '#ffdb13', '#65cbf3', '#0053d6'],
            labels: [
              'very low <50',
              'low 50-70',
              'confident 70-90',
              'very high >90',
            ],
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
  ).toEqual([antigen, variation, alphaMissense])
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
  expect(ids).toHaveLength(8)
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
