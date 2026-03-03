import { SessionWithAddTracks } from '@jbrowse/core/util'

/**
 * Fetches UniProt GFF data and extracts unique feature types
 */
export async function fetchUniProtFeatureTypes(
  uniprotId: string,
): Promise<string[]> {
  const url = `https://rest.uniprot.org/uniprotkb/${uniprotId}.gff`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`)
  }
  const data = await res.text()

  return [
    ...new Set(
      data
        .split('\n')
        .filter(f => !f.startsWith('#'))
        .map(f => f.trim())
        .filter(f => !!f)
        .map(f => f.split('\t')[2]!),
    ),
  ]
}

/**
 * Adds UniProt feature tracks for each feature type
 */
export function addUniProtFeatureTracks({
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
          uri: `https://rest.uniprot.org/uniprotkb/${uniprotId}.gff`,
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
export function addAntigenTrack({
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
export function addVariationTrack({
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
export function addAlphaFoldConfidenceTrack({
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
    })
  }
}

/**
 * Adds AlphaMissense pathogenicity scores track
 */
export function addAlphaMissenseTrack({
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
        renderers: {
          MultiDensityRenderer: {
            type: 'MultiDensityRenderer',
            bicolorPivotValue: 0.5,
            posColor: 'red',
            negColor: 'blue',
          },
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
  addAlphaMissenseTrack({
    session,
    uniprotId,
  })
}
