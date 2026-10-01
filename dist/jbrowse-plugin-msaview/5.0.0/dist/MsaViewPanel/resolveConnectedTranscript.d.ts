import type { JBrowsePluginMsaViewModel } from './model';
interface Region {
    assemblyName: string;
    refName: string;
    start: number;
    end: number;
}
interface GenomeView {
    tracks: {
        type: string;
    }[];
    displayedRegions: Region[];
    dynamicBlocks?: {
        contentBlocks?: Region[];
    };
}
/**
 * The part of the genome on screen, then everything the view can scroll to.
 * `displayedRegions` is usually whole chromosomes -- navigating to a locus
 * displays its parent region -- so it is the fallback, not the first ask.
 */
export declare function searchWindows(view: GenomeView): {
    assemblyName: string;
    refName: string;
    start: number;
    end: number;
}[][];
/**
 * Gene models live on feature tracks. Asking an alignments, variant or
 * quantitative track for a chromosome's worth of features to look for a
 * transcript among them is the slowest possible way to find nothing.
 */
export declare function transcriptTracks<T extends {
    type: string;
}>(tracks: T[]): T[];
/**
 * Resolve `connectedTranscript` into `connectedFeature` once the connected
 * genome view has its assembly and tracks, then hand the translation to
 * whichever launch is waiting for a query.
 *
 * The autorun re-fires on the view's readiness (a track opened after a miss)
 * and on the request itself, which is what `retryLaunch` re-states. The lookup
 * runs untracked, so scrolling the genome view is not a reason to look again.
 */
export declare function resolveConnectedTranscriptIfNeeded(self: JBrowsePluginMsaViewModel): void;
export {};
