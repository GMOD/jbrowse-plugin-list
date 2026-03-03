import { textfetch } from '../../fetchUtils'
import { getGeneDisplayName, getTranscriptDisplayName } from '../utils/util'

import type { Feature, SessionWithAddTracks } from '@jbrowse/core/util'
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

export async function launchLinearProteinAnnotationView({
  session,
  uniprotId,
  feature,
  selectedTranscript,
  confidenceUrl,
}: {
  session: SessionWithAddTracks
  uniprotId: string
  feature: Feature
  selectedTranscript: Feature
  confidenceUrl: string
}) {
  try {
    session.addTemporaryAssembly?.({
      name: uniprotId,
      sequence: {
        type: 'ReferenceSequenceTrack',
        trackId: `${uniprotId}-ReferenceSequenceTrack`,
        sequenceType: 'pep',
        adapter: {
          type: 'UnindexedFastaAdapter',
          rewriteRefNames: "jexl:split(refName,'|')[1]",
          fastaLocation: {
            uri: `https://rest.uniprot.org/uniprotkb/${uniprotId}.fasta`,
          },
        },
      },
    })
    const trackConfigs = [
      ...new Set(
        (await textfetch(`https://rest.uniprot.org/uniprotkb/${uniprotId}.gff`))
          .split('\n')
          .filter(f => !f.startsWith('#'))
          .map(f => f.trim())
          .filter(f => !!f)
          .map(f => f.split('\t')[2]),
      ),
    ].map(type => {
      const s = `${uniprotId}-${type}`
      return {
        type: 'FeatureTrack',
        trackId: s,
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
            displayId: `${s}-LinearBasicDisplay`,
            type: 'LinearBasicDisplay',
            jexlFilters: [`get(feature,'type')=='${type}'`],
          },
        ],
      }
    })
    for (const trackConf of trackConfigs) {
      session.addTrackConf(trackConf)
    }
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
    const view = session.addView('LinearGenomeView', {
      type: 'LinearGenomeView',
      displayName: [
        'Protein view',
        uniprotId,
        getGeneDisplayName(feature),
        getTranscriptDisplayName(selectedTranscript),
      ].join(' - '),
    }) as LinearGenomeViewModel
    await view.navToLocString(uniprotId, uniprotId)
  } catch (e) {
    console.error(e)
    session.notifyError(`${e}`, e)
  }
}
