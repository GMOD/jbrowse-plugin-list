import { myfetch, uniprotGffUrl } from 'p2s_mapper';
import { thresholdBandColor } from './wiggleBandColors';
import { PLDDT_BANDS } from '../../ProteinView/residueTracks';
/**
 * Fetches UniProt GFF data and extracts unique feature types
 */
async function fetchUniProtFeatureTypes(uniprotId) {
    const data = await (await myfetch(uniprotGffUrl(uniprotId))).text();
    return [
        ...new Set(data
            .split('\n')
            .filter(f => !f.startsWith('#'))
            // column 3 is the GFF type; a line without one would otherwise become an
            // `undefined`-named track
            .map(f => f.split('\t')[2]?.trim())
            .filter((f) => !!f)),
    ];
}
/**
 * Adds UniProt feature tracks for each feature type
 */
function addUniProtFeatureTracks({ session, uniprotId, featureTypes, }) {
    featureTypes.forEach(type => {
        const trackId = `${uniprotId}-${type}`;
        session.addSessionTrackConf({
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
        });
    });
}
/**
 * Adds antigen annotation track from EBI
 */
function addAntigenTrack({ session, uniprotId, }) {
    session.addSessionTrackConf({
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
    });
}
/**
 * Adds variation track from EBI
 */
function addVariationTrack({ session, uniprotId, }) {
    session.addSessionTrackConf({
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
    });
}
/**
 * Adds AlphaFold confidence track
 */
function addAlphaFoldConfidenceTrack({ session, uniprotId, confidenceUrl, }) {
    if (confidenceUrl) {
        session.addSessionTrackConf({
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
                    color: thresholdBandColor('score', PLDDT_BANDS),
                },
            ],
        });
    }
}
/**
 * Adds AlphaMissense pathogenicity scores track
 */
function addAlphaMissenseTrack({ session, uniprotId, }) {
    session.addSessionTrackConf({
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
    });
}
/**
 * Adds all protein annotation tracks for a given UniProt ID
 */
export async function addAllProteinTracks({ session, uniprotId, confidenceUrl, }) {
    const featureTypes = await fetchUniProtFeatureTypes(uniprotId);
    addUniProtFeatureTracks({
        session,
        uniprotId,
        featureTypes,
    });
    addAntigenTrack({
        session,
        uniprotId,
    });
    addVariationTrack({
        session,
        uniprotId,
    });
    addAlphaFoldConfidenceTrack({
        session,
        uniprotId,
        confidenceUrl,
    });
    // AlphaFold DB publishes substitution scores for canonical entries only
    if (!uniprotId.includes('-')) {
        addAlphaMissenseTrack({
            session,
            uniprotId,
        });
    }
}
