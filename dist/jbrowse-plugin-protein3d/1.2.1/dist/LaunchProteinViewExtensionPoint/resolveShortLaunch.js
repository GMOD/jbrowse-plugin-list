import { readConfObject } from '@jbrowse/core/configuration';
import { parseLocString } from '@jbrowse/core/util';
import { stripTrailingVersion } from 'p2s_mapper';
import { codingTranscripts } from '../LaunchProteinView/codingFeature';
import { fetchProteinSeq } from '../LaunchProteinView/utils/translateTranscripts';
export function getTrackId(track) {
    if (typeof track === 'string') {
        return track;
    }
    const { trackId } = track;
    return typeof trackId === 'string' ? trackId : undefined;
}
// `transcript_id` because Ensembl's GFF3 prefixes the ID (`transcript:ENST…`)
export function transcriptMatches(transcript, transcriptId) {
    const target = stripTrailingVersion(transcriptId);
    return [
        transcript.get('name'),
        transcript.get('id'),
        transcript.get('transcript_id'),
        transcript.id(),
    ].some(candidate => typeof candidate === 'string' &&
        (candidate === transcriptId ||
            stripTrailingVersion(candidate) === target));
}
// Gene models live on feature tracks; a spec's variant or alignments track
// would be fetched for nothing
export function isFeatureTrack(trackConf) {
    return readConfObject(trackConf, 'type') === 'FeatureTrack';
}
async function findTranscript({ session, trackConfs, region, transcriptId, }) {
    for (const trackConf of trackConfs) {
        const feats = await session.rpcManager.call('getFeatures', 'CoreGetFeatures', {
            adapterConfig: readConfObject(trackConf, 'adapter'),
            regions: [region],
        });
        for (const feat of feats) {
            const hit = codingTranscripts(feat).find(t => transcriptMatches(t, transcriptId));
            if (hit) {
                return hit;
            }
        }
    }
    return undefined;
}
/**
 * Headless counterpart of the interactive AlphaFoldDBSearch → TranscriptSelector
 * flow. Given a `transcriptId` and a connected genome view spec, it derives the
 * two things a ProteinView structure needs beyond its file: the transcript
 * `feature` (for the genome↔protein mapping) and the translated protein
 * sequence (for the alignment). Every failure throws with a descriptive message
 * so the caller can surface it — nothing degrades silently to an unlinked
 * structure.
 */
export async function resolveShortLaunch({ session, transcriptId, connectedView, }) {
    if (!transcriptId) {
        throw new Error('transcriptId is required to launch from a uniprotId or pdbId');
    }
    const assemblyName = connectedView?.assembly;
    const loc = connectedView?.loc;
    const trackSpecs = connectedView?.tracks ?? [];
    if (!assemblyName || !loc) {
        throw new Error('connectedView with assembly + loc is required to launch from a uniprotId');
    }
    const assembly = await session.assemblyManager.waitForAssembly(assemblyName);
    if (!assembly) {
        throw new Error(`assembly "${assemblyName}" not found`);
    }
    const parsed = parseLocString(loc, refName => assembly.isValidRefName(refName));
    if (parsed.start === undefined || parsed.end === undefined) {
        throw new Error(`could not parse a start-end region from loc "${loc}"`);
    }
    const region = {
        assemblyName,
        refName: assembly.getCanonicalRefName(parsed.refName) ?? parsed.refName,
        start: parsed.start,
        end: parsed.end,
    };
    const trackIds = trackSpecs.map(getTrackId).filter(t => t !== undefined);
    const transcript = await findTranscript({
        session,
        trackConfs: trackIds.flatMap(trackId => {
            const conf = session.getTrackById(trackId);
            return conf && isFeatureTrack(conf) ? [conf] : [];
        }),
        region,
        transcriptId,
    });
    if (!transcript) {
        throw new Error(`transcript "${transcriptId}" not found at ${loc} in the feature tracks of [${trackIds.join(', ')}]`);
    }
    const userProvidedTranscriptSequence = await fetchProteinSeq({
        session,
        assemblyName,
        feature: transcript,
    });
    if (!userProvidedTranscriptSequence) {
        throw new Error(`could not translate a protein sequence for "${transcriptId}"`);
    }
    return {
        feature: transcript.toJSON(),
        userProvidedTranscriptSequence,
    };
}
