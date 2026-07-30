import type { AbstractSessionModel, SimpleFeatureSerialized } from '@jbrowse/core/util';
export interface ConnectedViewSpec {
    loc?: string;
    assembly?: string;
    tracks?: (string | Record<string, unknown>)[];
}
export interface ResolvedShortLaunch {
    url: string;
    feature: SimpleFeatureSerialized;
    userProvidedTranscriptSequence: string;
}
/**
 * Headless counterpart of the interactive AlphaFoldDBSearch → TranscriptSelector
 * flow. Given a `uniprotId`, a `transcriptId`, and a connected genome view spec,
 * it derives the three things a ProteinView structure needs: the AlphaFold
 * structure URL, the transcript `feature` (for the genome↔protein mapping), and
 * the translated protein sequence (for the alignment). Every failure throws with
 * a descriptive message so the caller can surface it — nothing degrades silently
 * to an unlinked structure.
 */
export declare function resolveShortLaunch({ session, uniprotId, transcriptId, connectedView, }: {
    session: AbstractSessionModel;
    uniprotId: string;
    transcriptId?: string;
    connectedView?: ConnectedViewSpec;
}): Promise<ResolvedShortLaunch>;
