import { getEnv } from '@jbrowse/mobx-state-tree'
import { myfetch, uniprotGffUrl } from 'p2s_mapper'

import { jexlBandColor, thresholdBandColor } from './wiggleBandColors'
import { PLDDT_BANDS } from '../../ProteinView/residueTracks'

import type { SessionWithAddTracks } from '../utils/sessionWithAddTracks'
import type PluginManager from '@jbrowse/core/PluginManager'

/**
 * Fetches UniProt GFF data and extracts unique feature types
 */
async function fetchUniProtFeatureTypes(uniprotId: string): Promise<string[]> {
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

/**
 * Adds UniProt feature tracks for each feature type
 */
function addUniProtFeatureTracks({
  session,
  uniprotId,
  featureTypes,
}: {
  session: SessionWithAddTracks
  uniprotId: string
  featureTypes: string[]
}) {
  featureTypes.forEach(type => {
    const trackId = `${uniprotId}-${type}`
    session.addTrackConf({
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
    })
  })
}

/**
 * Adds antigen annotation track from EBI
 */
function addAntigenTrack({
  session,
  uniprotId,
}: {
  session: SessionWithAddTracks
  uniprotId: string
}) {
  session.addTrackConf({
    type: 'FeatureTrack',
    trackId: `${uniprotId}-Antigen`,
    name: 'Antigen',
    adapter: {
      type: 'Gff3Adapter',
      gffLocation: {
        uri: `https://www.ebi.ac.uk/proteins/api/antigen/${uniprotId}?format=gff`,
      },
    },
    assemblyNames: [uniprotId],
  })
}

/**
 * Adds variation track from EBI
 */
function addVariationTrack({
  session,
  uniprotId,
}: {
  session: SessionWithAddTracks
  uniprotId: string
}) {
  session.addTrackConf({
    type: 'FeatureTrack',
    trackId: `${uniprotId}-Variation`,
    name: 'Variation',
    adapter: {
      type: 'UniProtVariationAdapter',
      location: {
        uri: `https://www.ebi.ac.uk/proteins/api/variation/${uniprotId}.json`,
      },
    },
    assemblyNames: [uniprotId],
  })
}

/**
 * Adds AlphaFold confidence track
 */
function addAlphaFoldConfidenceTrack({
  session,
  uniprotId,
  confidenceUrl,
}: {
  session: SessionWithAddTracks
  uniprotId: string
  confidenceUrl: string | undefined
}) {
  if (confidenceUrl) {
    session.addTrackConf({
      type: 'QuantitativeTrack',
      trackId: `${uniprotId}-AlphaFold-confidence`,
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
          displayId: `${uniprotId}-AlphaFold-confidence-LinearWiggleDisplay`,
          // Each host drops the key it does not declare: v4 reads the
          // renderers, v5 the display's `color`.
          renderers: {
            XYPlotRenderer: { color: jexlBandColor('score', PLDDT_BANDS) },
            DensityRenderer: { color: jexlBandColor('score', PLDDT_BANDS) },
          },
          color: thresholdBandColor('score', PLDDT_BANDS),
        },
      ],
    })
  }
}

/**
 * Adds AlphaMissense pathogenicity scores track
 */
function addAlphaMissenseTrack({
  session,
  uniprotId,
  hasMultiWiggleDisplay,
}: {
  session: SessionWithAddTracks
  uniprotId: string
  hasMultiWiggleDisplay: boolean
}) {
  session.addTrackConf({
    type: 'MultiQuantitativeTrack',
    trackId: `${uniprotId}-AlphaMissense-scores`,
    name: 'AlphaMissense scores',
    assemblyNames: [uniprotId],
    adapter: {
      type: 'AlphaMissensePathogenicityAdapter',
      location: {
        uri: `https://alphafold.ebi.ac.uk/files/AF-${uniprotId}-F1-aa-substitutions.csv`,
      },
    },
    // v5 folded MultiLinearWiggleDisplay into LinearWiggleDisplay and warns on
    // a config naming the old type. v4's density renderer ramps from white to
    // posColor, so pathogenic reads red; v5 diverges at AlphaMissense's 0.5.
    displays: [
      hasMultiWiggleDisplay
        ? {
            type: 'MultiLinearWiggleDisplay',
            displayId: `${uniprotId}-AlphaMissense-scores-MultiLinearWiggleDisplay`,
            defaultRendering: 'multirowdensity',
            renderers: { MultiDensityRenderer: { posColor: '#d7191c' } },
          }
        : {
            type: 'LinearWiggleDisplay',
            displayId: `${uniprotId}-AlphaMissense-scores-LinearWiggleDisplay`,
            defaultRendering: 'density',
            color: {
              field: 'score',
              scale: 'linear',
              range: ['#2c7bb6', '#ffffff', '#d7191c'],
              domainMid: 0.5,
            },
          },
    ],
  })
}

/**
 * Adds all protein annotation tracks for a given UniProt ID
 */
export async function addAllProteinTracks({
  session,
  uniprotId,
  confidenceUrl,
}: {
  session: SessionWithAddTracks
  uniprotId: string
  confidenceUrl: string | undefined
}) {
  const featureTypes = await fetchUniProtFeatureTypes(uniprotId)
  addUniProtFeatureTracks({
    session,
    uniprotId,
    featureTypes,
  })
  addAntigenTrack({
    session,
    uniprotId,
  })
  addVariationTrack({
    session,
    uniprotId,
  })
  addAlphaFoldConfidenceTrack({
    session,
    uniprotId,
    confidenceUrl,
  })
  // AlphaFold DB publishes substitution scores for canonical entries only
  if (!uniprotId.includes('-')) {
    addAlphaMissenseTrack({
      session,
      uniprotId,
      hasMultiWiggleDisplay: getEnv<{ pluginManager: PluginManager }>(session)
        .pluginManager.getDisplayElements()
        .some(d => d.name === 'MultiLinearWiggleDisplay'),
    })
  }
}
