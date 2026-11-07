import type { AbstractSessionModel } from '@jbrowse/core/util';
/**
 * Where a launched MSA view lands. Every launch names one of these and stops
 * there, so a host that arranges views differently is one function to teach.
 *
 *   stack       append below whatever is on screen
 *   splitRight  its own cell to the right, beside the view it is connected to
 *   newTab      its own tab in the current cell
 */
export type MsaViewPlacement = 'stack' | 'splitRight' | 'newTab';
/**
 * What the dialog does unasked. Side-by-side, because a launch from a gene
 * feature sets `connectedViewId`: the pair shares a hover and a highlight, and
 * reads as a split. A session spec defaults to `stack` instead.
 */
export declare const DEFAULT_LAUNCH_PLACEMENT: MsaViewPlacement;
export declare const LAUNCH_PLACEMENT_KEY = "msaView-launchPlacement";
export declare function resetWorkspacesWarning(): void;
/**
 * Whether this host can honor anything other than `stack`. Silent: the dialog
 * asks on every render, and only a launch is worth warning about.
 */
export declare function sessionSupportsPlacement(session: AbstractSessionModel): boolean;
/**
 * Put a freshly added view where the launch said to. `stack` is a placement
 * rather than the absence of one, so no caller has to ask what host it is on.
 */
export declare function placeMsaView(session: AbstractSessionModel, viewId: string, placement: MsaViewPlacement): void;
/**
 * The dialog's own remembered choice — not the host's preferences system, which
 * records whether the user likes workspaces and does not exist everywhere.
 */
export declare function readLaunchPlacement(): MsaViewPlacement;
export declare function writeLaunchPlacement(placement: MsaViewPlacement): void;
