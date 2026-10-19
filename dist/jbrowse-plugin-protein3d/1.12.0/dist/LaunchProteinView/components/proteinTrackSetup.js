import { myfetch, uniprotGffUrl } from 'p2s_mapper';
import { thresholdBandColor } from './wiggleBandColors';
import { PLDDT_BANDS } from '../../ProteinView/residueTracks';
import { inUniProtOrder } from '../../ProteinView/uniprotFeatureTypes';
import { ALPHAMISSENSE_MID, ALPHAMISSENSE_RANGE, } from '../../ProteinView/variantEffects';
export async function fetchUniProtFeatureTypes(uniprotId) {
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
// One track sectioned by type rather than a track per type: an entry carries
// up to ~20 types, and a page gets 16 WebGL2 contexts, one per GPU track
function uniProtFeatureTrackConf({ uniprotId, featureTypes, idPrefix, }) {
    const trackId = `${idPrefix}-UniProt-features`;
    const domain = inUniProtOrder(featureTypes);
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
                facet: { field: 'type', domain },
                height: Math.min(450, 60 + 26 * domain.length),
            },
        ],
    };
}
function antigenTrackConf(uniprotId, idPrefix) {
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
    };
}
function alphaFoldConfidenceTrackConf({ uniprotId, confidenceUrl, idPrefix, }) {
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
    };
}
function alphaMissenseTrackConf(uniprotId, idPrefix) {
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
                    range: [...ALPHAMISSENSE_RANGE],
                    domainMid: ALPHAMISSENSE_MID,
                },
            },
        ],
    };
}
/**
 * Every annotation track of a UniProt entry that needs only the entry, as
 * configs for the view to carry; the ClinVar track, which needs the linked
 * transcript, is built by clinVarTrackSource. `idPrefix` has to be unique to
 * the view: two views of one entry each hold their own copy, and a session
 * tree cannot hold one trackId twice.
 */
export function proteinTrackConfs({ uniprotId, featureTypes, confidenceUrl, idPrefix, }) {
    return [
        uniProtFeatureTrackConf({ uniprotId, featureTypes, idPrefix }),
        antigenTrackConf(uniprotId, idPrefix),
        ...(confidenceUrl
            ? [alphaFoldConfidenceTrackConf({ uniprotId, confidenceUrl, idPrefix })]
            : []),
        alphaMissenseTrackConf(uniprotId, idPrefix),
    ];
}
