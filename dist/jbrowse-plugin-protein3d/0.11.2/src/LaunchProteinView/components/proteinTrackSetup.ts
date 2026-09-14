import { myfetch } from '../../fetchUtils'
import { uniprotGffUrl } from '../utils/structureUrls'

import type { SessionWithAddTracks } from '../utils/sessionWithAddTracks'

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
          // pLDDT 50 is AlphaFold's own line between low and very low
          // confidence: residues above it in AlphaFold's blue, below in its
          // orange
          bicolorPivot: 50,
          posColor: '#0053d6',
          negColor: '#ff7d45',
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
}: {
  session: SessionWithAddTracks
  uniprotId: string
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
    displays: [
      {
        type: 'MultiLinearWiggleDisplay',
        displayId: `${uniprotId}-AlphaMissense-scores-MultiLinearWiggleDisplay`,
        defaultRendering: 'multirowdensity',
        // AlphaMissense's own reading: likely pathogenic red, likely benign
        // blue, fading to white at the midpoint of its 0-1 score
        bicolorPivot: 0.5,
        posColor: '#d7191c',
        negColor: '#2c7bb6',
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
    })
  }
}
