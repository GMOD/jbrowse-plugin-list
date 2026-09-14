import { resolveStructureUrl, structureDisplayLabel, } from '../LaunchProteinView/utils/structureUrls';
/**
 * The single source of truth for turning a ProteinViewSpec into the snapshot
 * handed to `session.addView('ProteinView', ...)`. Every launch path funnels
 * through here so they can't drift into different subsets of the same view.
 */
/**
 * The name a view gets when its snapshot carries none: the transcript it maps
 * and each structure's label, so a session written by hand or by a page opens
 * as "Protein view - TP53 - 1TUP" rather than "Untitled view".
 */
export function defaultDisplayName(structures) {
    const featureName = structures.find(s => s.feature)?.feature?.name;
    return [
        'Protein view',
        typeof featureName === 'string' ? featureName : undefined,
        ...structures.map(s => structureDisplayLabel({ url: resolveStructureUrl(s), data: s.data })),
    ]
        .filter(s => !!s)
        .join(' - ');
}
export function proteinViewSnapshot(spec) {
    const { structures, ...view } = spec;
    return {
        type: 'ProteinView',
        ...view,
        structures: structures.map(structure => ({
            ...structure,
            userProvidedTranscriptSequence: structure.userProvidedTranscriptSequence ?? '',
        })),
    };
}
