import type { JBrowsePluginMsaViewModel } from './model';
import type { AnyConfigurationModel } from '@jbrowse/core/configuration';
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
    configuration: AnyConfigurationModel;
}>(tracks: readonly T[]): T[];
interface ConnectableView {
    initialized: boolean;
    pendingLaunch?: unknown;
    error?: unknown;
    tracks: readonly {
        type: string;
    }[];
}
/**
 * Whether the connected genome view can be searched for `transcriptId` yet. A
 * view still initializing, or still opening the tracks its launch names, is
 * waited for; everything else that stops a lookup is a problem to report,
 * since nothing would otherwise end the wait. `namedViewType` is the type of
 * whatever view `connectedViewId` names, and `connectedView` that view only
 * when it is a genome view.
 */
export declare function lookupReadiness<V extends ConnectableView>({ transcriptId, connectedViewId, namedViewType, connectedView, }: {
    transcriptId: string;
    connectedViewId: string | undefined;
    namedViewType: string | undefined;
    connectedView: V | undefined;
}): {
    problem: string;
} | {
    waiting: true;
} | {
    view: V;
};
/**
 * Resolve `connectedTranscript` into `connectedFeature` once the connected
 * genome view has its assembly and tracks, then hand the translation to
 * whichever launch is waiting for a query.
 *
 * The autorun re-fires on the view's readiness (a track opened after a miss,
 * a view that arrives after this one) and on the request itself, which is what
 * `retryLaunch` re-states. The lookup runs untracked, so scrolling the genome
 * view is not a reason to look again.
 */
export declare function resolveConnectedTranscriptIfNeeded(self: JBrowsePluginMsaViewModel): void;
export {};
