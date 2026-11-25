import { myfetch, uniprotGffUrl } from 'p2s_mapper'

import { colorChannel } from '../../ProteinView/colorScale'
import { RESIDUE_COLORS } from '../../ProteinView/residueColors'
import { UNIPROT_FEATURE_COLOR } from '../../ProteinView/uniprotFeatureTypes'

import type { LinearColor, ThresholdColor } from '../../ProteinView/colorScale'

export interface ProteinTrackConf {
  [key: string]: unknown
  type: string
  trackId: string
  name: string
}

// A quantitative display's color reads only `score`, and a linear one ramps
// across the plot's y domain, so it takes the ramp's stops, middle and title
function wiggleColor(color: LinearColor | ThresholdColor) {
  if (color.scale === 'threshold') {
    return colorChannel({ ...color, field: 'score' })
  }
  const { scale, range, domainMid, title } = color
  return colorChannel({ field: 'score', scale, range, domainMid, title })
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

// One track sectioned by type rather than a track per type: an entry carries
// up to ~20 types, and a page gets 16 WebGL2 contexts, one per GPU track
function uniProtFeatureTrackConf({
  uniprotId,
  featureTypes,
  idPrefix,
}: {
  uniprotId: string
  featureTypes: string[]
  idPrefix: string
}): ProteinTrackConf {
  const trackId = `${idPrefix}-UniProt-features`
  return {
    type: 'FeatureTrack',
    trackId,
    name: 'UniProt features',
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
        encoding: { color: colorChannel(UNIPROT_FEATURE_COLOR) },
        facet: { field: 'type', sort: UNIPROT_FEATURE_COLOR.domain },
        height: Math.min(450, 60 + 26 * featureTypes.length),
      },
    ],
  }
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
        encoding: { color: wiggleColor(RESIDUE_COLORS.plddt) },
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
        encoding: { color: wiggleColor(RESIDUE_COLORS.alphaMissense) },
      },
    ],
  }
}

/**
 * Every annotation track of a UniProt entry that needs only the entry, as
 * configs for the view to carry; the ClinVar track, which needs the linked
 * transcript, is built by clinVarTrackSource. `idPrefix` has to be unique to
 * the view: two views of one entry each hold their own copy, and a session
 * tree cannot hold one trackId twice.
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
    uniProtFeatureTrackConf({ uniprotId, featureTypes, idPrefix }),
    antigenTrackConf(uniprotId, idPrefix),
    ...(confidenceUrl
      ? [alphaFoldConfidenceTrackConf({ uniprotId, confidenceUrl, idPrefix })]
      : []),
    alphaMissenseTrackConf(uniprotId, idPrefix),
  ]
}
