import { myfetch, uniprotGffUrl } from 'p2s_mapper'

import { thresholdBandColor } from './wiggleBandColors'
import { PLDDT_BANDS } from '../../ProteinView/residueTracks'

export interface ProteinTrackConf {
  [key: string]: unknown
  type: string
  trackId: string
  name: string
}

export async function fetchUniProtFeatureTypes(
  uniprotId: string,
): Promise<string[]> {
  const data = await (await myfetch(uniprotGffUrl(uniprotId))).text()

  return [
    ...new Set(
      data
        .split('\n')
        .filter(f => !f.startsWith('#'))
        // column 3 is the GFF type; a line without one would otherwise become an
        // `undefined`-named track
        .map(f => f.split('\t')[2]?.trim())
        .filter((f): f is string => !!f),
    ),
  ]
}

function uniProtFeatureTrackConfs({
  uniprotId,
  featureTypes,
  idPrefix,
}: {
  uniprotId: string
  featureTypes: string[]
  idPrefix: string
}): ProteinTrackConf[] {
  return featureTypes.map(type => {
    const trackId = `${idPrefix}-${type}`
    return {
      type: 'FeatureTrack',
      trackId,
      name: type,
      adapter: {
        type: 'Gff3Adapter',
        gffLocation: {
          uri: uniprotGffUrl(uniprotId),
        },
      },
      assemblyNames: [uniprotId],
      displays: [
        {
          displayId: `${trackId}-LinearBasicDisplay`,
          type: 'LinearBasicDisplay',
          jexlFilters: [`get(feature,'type')=='${type}'`],
        },
      ],
    }
  })
}

function antigenTrackConf(
  uniprotId: string,
  idPrefix: string,
): ProteinTrackConf {
  return {
    type: 'FeatureTrack',
    trackId: `${idPrefix}-Antigen`,
    name: 'Antigen',
    adapter: {
      type: 'Gff3Adapter',
      gffLocation: {
        uri: `https://www.ebi.ac.uk/proteins/api/antigen/${uniprotId}?format=gff`,
      },
    },
    assemblyNames: [uniprotId],
  }
}

function variationTrackConf(
  uniprotId: string,
  idPrefix: string,
): ProteinTrackConf {
  return {
    type: 'FeatureTrack',
    trackId: `${idPrefix}-Variation`,
    name: 'Variation',
    adapter: {
      type: 'UniProtVariationAdapter',
      location: {
        uri: `https://www.ebi.ac.uk/proteins/api/variation/${uniprotId}.json`,
      },
    },
    assemblyNames: [uniprotId],
  }
}

function alphaFoldConfidenceTrackConf({
  uniprotId,
  confidenceUrl,
  idPrefix,
}: {
  uniprotId: string
  confidenceUrl: string
  idPrefix: string
}): ProteinTrackConf {
  return {
    type: 'QuantitativeTrack',
    trackId: `${idPrefix}-AlphaFold-confidence`,
    name: 'AlphaFold confidence',
    adapter: {
      type: 'AlphaFoldConfidenceAdapter',
      location: {
        uri: confidenceUrl,
      },
    },
    assemblyNames: [uniprotId],
    displays: [
      {
        type: 'LinearWiggleDisplay',
        displayId: `${idPrefix}-AlphaFold-confidence-LinearWiggleDisplay`,
        color: thresholdBandColor('score', PLDDT_BANDS),
      },
    ],
  }
}

function alphaMissenseTrackConf(
  uniprotId: string,
  idPrefix: string,
): ProteinTrackConf {
  return {
    type: 'MultiQuantitativeTrack',
    trackId: `${idPrefix}-AlphaMissense-scores`,
    name: 'AlphaMissense scores',
    assemblyNames: [uniprotId],
    adapter: {
      type: 'AlphaMissensePathogenicityAdapter',
      location: {
        uri: `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-aa-substitutions.csv`,
      },
    },
    displays: [
      {
        type: 'LinearWiggleDisplay',
        displayId: `${idPrefix}-AlphaMissense-scores-LinearWiggleDisplay`,
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
}

/**
 * Every annotation track of a UniProt entry, as configs for the view to carry.
 * `idPrefix` has to be unique to the view: two views of one entry each hold
 * their own copy, and a session tree cannot hold one trackId twice.
 */
export function proteinTrackConfs({
  uniprotId,
  featureTypes,
  confidenceUrl,
  idPrefix,
}: {
  uniprotId: string
  featureTypes: string[]
  confidenceUrl: string | undefined
  idPrefix: string
}): ProteinTrackConf[] {
  return [
    ...uniProtFeatureTrackConfs({ uniprotId, featureTypes, idPrefix }),
    antigenTrackConf(uniprotId, idPrefix),
    variationTrackConf(uniprotId, idPrefix),
    ...(confidenceUrl
      ? [alphaFoldConfidenceTrackConf({ uniprotId, confidenceUrl, idPrefix })]
      : []),
    alphaMissenseTrackConf(uniprotId, idPrefix),
  ]
}
