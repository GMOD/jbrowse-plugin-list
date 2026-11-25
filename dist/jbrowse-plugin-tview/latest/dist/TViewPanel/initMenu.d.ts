import type { TviewInit } from './init';
import type { RegionLaunch } from '../LaunchTView/launch';
import type { MenuItem } from '@jbrowse/core/ui';
import type { IAnyStateTreeNode } from '@jbrowse/mobx-state-tree';
export declare const TRACKS_LABEL = "Tracks";
export declare const CURRENT_REGION_LABEL = "Show the connected view's current region";
export interface TrackChoice {
    trackId: string;
    label: string;
}
/** the alignments tracks open in the genome view, then any others `init` reads */
export declare function trackChoiceIds(init: TviewInit, openTrackIds: string[]): string[];
export declare function withTrack(init: TviewInit, trackId: string, included: boolean): TviewInit;
export declare function atRegion(init: TviewInit, { assembly, loc }: {
    assembly: string;
    loc: string;
}): TviewInit;
export declare function initMenuItems({ init, choices, region, setInit, }: {
    init: TviewInit;
    choices: TrackChoice[];
    region: RegionLaunch;
    setInit: (init: TviewInit) => void;
}): MenuItem[];
export declare function tviewInitMenuItems(view: IAnyStateTreeNode & {
    init?: TviewInit;
    connectedView?: object;
    setInit: (init: TviewInit) => void;
}): MenuItem[];
