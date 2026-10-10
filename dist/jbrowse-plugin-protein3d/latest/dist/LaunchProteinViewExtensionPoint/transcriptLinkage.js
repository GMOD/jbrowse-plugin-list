import { resolveGeneNameLaunch } from './findGeneByName';
import { resolveShortLaunch } from './resolveShortLaunch';
/**
 * The transcript a launch links to and the genome view spec it connects
 * through, shared by every view a spec can link to the genome. A `gene` is
 * looked up through the text search index, which also supplies a genome view
 * on the gene; otherwise a `transcriptId` is found in the `connectedView`'s
 * tracks. A `connectedViewId` keeps the view spec the launch gave. Every
 * failure throws, so a launch never opens half-linked.
 */
export async function resolveTranscriptLinkage(session, { gene, transcriptId, uniprotId, userProvidedTranscriptSequence, connectedView: givenConnectedView, connectedViewId, }, { findStructure }) {
    const named = gene && !userProvidedTranscriptSequence
        ? await resolveGeneNameLaunch({
            session,
            gene,
            transcriptId,
            uniprotId,
            findStructure,
            connectedView: givenConnectedView,
            connectedViewId,
        })
        : undefined;
    const connectedView = connectedViewId
        ? givenConnectedView
        : (named?.connectedView ?? givenConnectedView);
    const resolved = named ??
        (!userProvidedTranscriptSequence && transcriptId
            ? await resolveShortLaunch({ session, transcriptId, connectedView })
            : undefined);
    return { named, resolved, connectedView };
}
/**
 * The genome view a launch links to. A session spec launches each view with
 * an auto-generated id, so it cannot cross-reference one by id; given a
 * `connectedView` instead, the launch creates the LinearGenomeView itself.
 */
export function connectGenomeView(session, connectedViewId, connectedView) {
    return (connectedViewId ??
        (connectedView
            ? session.addView('LinearGenomeView', {
                ...connectedView,
                type: 'LinearGenomeView',
            }).id
            : undefined));
}
