import { CLINVAR_CATEGORIES, clinVarCategory } from '../../ProteinView/clinVar';
import { colorChannel } from '../../ProteinView/colorScale';
// The structure's ClinVar coloring counts pathogenic calls in reds; the track
// shows every classification, so the reds are kept for the pathogenic end,
// greens for the benign end, and greys for what ClinVar cannot decide.
export const CLINVAR_CATEGORY_COLOR = {
    field: 'category',
    scale: 'categorical',
    domain: CLINVAR_CATEGORIES,
    range: [
        '#a50f15',
        '#de2d26',
        '#fd8d3c',
        '#969696',
        '#74c476',
        '#238b45',
        '#bdbdbd',
    ],
    labels: [
        'Pathogenic',
        'Likely pathogenic',
        'Conflicting',
        'Uncertain significance',
        'Likely benign',
        'Benign',
        'Other',
    ],
    title: 'ClinVar classification',
};
/**
 * One feature per placed variant, on the entry's residues. A variant whose
 * residue the entry does not share with the transcript (an isoform's private
 * exon) has nowhere to go and is left out.
 */
export function clinVarTrackFeatures({ placed, uniprotId, toEntryPosition, }) {
    return placed
        .flatMap(({ variant, residue, from, to }, index) => {
        const position = toEntryPosition(residue);
        if (position === undefined) {
            return [];
        }
        const category = clinVarCategory(variant.significance);
        const name = `${from}${position + 1}${to}`;
        const onTranscript = `${from}${residue + 1}${to}`;
        return [
            {
                uniqueId: `clinvar-${variant.id ?? `${variant.start}${variant.alt}`}-${index}`,
                refName: uniprotId,
                start: position,
                end: position + 1,
                name,
                type: 'missense_variant',
                category,
                significance: variant.significance.join(', ').replaceAll('_', ' '),
                ...(variant.id === undefined ? {} : { clinvarId: variant.id }),
                ...(onTranscript === name ? {} : { transcriptChange: onTranscript }),
            },
        ];
    })
        .sort((a, b) => a.start - b.start || a.name.localeCompare(b.name));
}
export function clinVarTrackConf({ uniprotId, idPrefix, features, }) {
    const trackId = `${idPrefix}-ClinVar`;
    return {
        type: 'FeatureTrack',
        trackId,
        name: 'ClinVar',
        assemblyNames: [uniprotId],
        adapter: {
            type: 'FromConfigAdapter',
            adapterId: trackId,
            features,
        },
        displays: [
            {
                type: 'LinearBasicDisplay',
                displayId: `${trackId}-LinearBasicDisplay`,
                encoding: { color: colorChannel(CLINVAR_CATEGORY_COLOR) },
            },
        ],
    };
}
