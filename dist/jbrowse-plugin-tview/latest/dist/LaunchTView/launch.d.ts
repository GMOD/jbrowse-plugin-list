import type { LocAssembly, TviewTrackInit } from '../TViewPanel/init';
import type { AbstractSessionModel } from '@jbrowse/core/util';
export interface WholeBaseRegion {
    assemblyName: string;
    refName: string;
    start: number;
    end: number;
}
export interface TrackLike {
    configuration: {
        trackId: string;
    };
    displays: readonly {
        type: string;
    }[];
}
export interface GenomeView {
    id: string;
    tracks: readonly TrackLike[];
    visibleWholeBaseRegions: WholeBaseRegion[];
}
export interface AssemblySource {
    assemblyManager: {
        get: (name: string) => (LocAssembly & {
            initialized: boolean;
        }) | undefined;
    };
}
export interface TViewLaunch {
    assembly: string;
    loc: string;
    tracks: TviewTrackInit[];
    connectedViewId?: string;
}
export type RegionLaunch = {
    assembly: string;
    loc: string;
    reason?: undefined;
} | {
    reason: string;
};
export declare function isGenomeView(view: object): view is GenomeView;
export declare function alignmentsTrackIds(tracks: readonly TrackLike[]): string[];
/**
 * The locus a tview over `regions` would show, or why there is none. The width
 * and contig rules are {@link checkRegion}'s, so a menu offers exactly what the
 * view would then agree to load.
 */
export declare function regionLaunch(session: AssemblySource, regions: readonly WholeBaseRegion[]): RegionLaunch;
export declare function launchTView(session: Pick<AbstractSessionModel, 'addView'>, { assembly, loc, tracks, connectedViewId }: TViewLaunch, viewProps?: Record<string, unknown>): import("@jbrowse/core/util").AbstractViewModel;
