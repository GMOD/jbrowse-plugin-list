/**
 * The single source of truth for turning a ProteinViewSpec into the snapshot
 * handed to `session.addView('ProteinView', ...)`. Every launch path funnels
 * through here so they can't drift into different subsets of the same view.
 */
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
