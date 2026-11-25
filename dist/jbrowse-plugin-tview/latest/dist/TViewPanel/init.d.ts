import type { FetchRegion, TviewSource } from '../LaunchTView/fetchTviewPlan';
import type { AbstractSessionModel } from '@jbrowse/core/util';
/**
 * One alignment file the view reads, and optionally the name to group its rows
 * under. A bare trackId is the same thing with the name left to the track.
 */
export type TviewTrackInit = string | {
    trackId: string;
    sample?: string;
};
/**
 * Everything a tview is: a locus, an assembly, and the alignment files to read
 * it from.
 *
 * The view is declared with this and derives the rest, in the shape
 * LinearGenomeView's `init` uses. Two things follow from that which are worth
 * saying out loud:
 *
 * - A session can **author** a tview. `{ type: 'TView', init: { … } }` in a
 *   defaultSession opens one with no click path — as does the flat form of the
 *   same keys in a session spec URL, which is what makes a repeat locus a link.
 * - There is one code path. Launching from a menu, restoring a saved session
 *   and following a link all end up applying the same blob, and changing what
 *   the view shows from its own menu is replacing that blob.
 *
 * Unlike LinearGenomeView's, this init is **kept, not cleared**. What it
 * resolves to — the alignment and its row table — is kept out of snapshots and
 * rebuilt from it on restore, so the blob is the only durable statement of what
 * the view is.
 */
export interface TviewInit {
    /** assembly the locus and the tracks belong to */
    assembly: string;
    /** locstring, e.g. `chrX:146,993,530..146,993,670` */
    loc: string;
    /** the alignment files to draw rows from, in order */
    tracks: TviewTrackInit[];
}
export type RegionCheck = {
    region: FetchRegion;
    error?: undefined;
} | {
    region?: undefined;
    error: string;
};
/** the slice of a loaded assembly that a locstring is resolved against */
export interface LocAssembly {
    name: string;
    isValidRefName: (refName: string) => boolean;
    getCanonicalRefName2: (refName: string) => string;
    getRegionForRefName: (refName: string) => {
        start: number;
        end: number;
    } | undefined;
}
/**
 * The region `loc` names on `assembly`, under the assembly's own name for the
 * sequence and clamped to it, or why there is none: a locstring that does not
 * parse, a region off the end of the contig, or one wider than {@link MAX_BP}.
 * A bare refName means the whole contig, and is held to the same limit.
 */
export declare function checkRegion(assembly: LocAssembly, loc: string): RegionCheck;
/** {@link checkRegion} for `init`, or undefined until its assembly has loaded */
export declare function initRegion(session: AbstractSessionModel, init: TviewInit): RegionCheck | undefined;
export declare function entryTrackId(entry: TviewTrackInit): string;
/** what rows from `entry` are grouped under, or its trackId if no track has it */
export declare function trackLabel(session: AbstractSessionModel, entry: TviewTrackInit): string;
/**
 * The sources `init.tracks` names, or undefined until every one of them
 * resolves. All or nothing: a partial set comes back with samples missing and
 * nothing on screen says any were.
 */
export declare function initSources(session: AbstractSessionModel, init: TviewInit): TviewSource[] | undefined;
/** the trackIds `init.tracks` names that this session has no track for */
export declare function missingTrackIds(session: AbstractSessionModel, init: TviewInit): string[];
