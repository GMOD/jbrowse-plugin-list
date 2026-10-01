import type { JBrowsePluginMsaViewModel } from './model';
/**
 * What a launch is allowed to do to the model and to the network while it runs.
 *
 * Every write a launch makes goes through `act`, so "nothing touches the model
 * once the launch has been abandoned" is one rule in one place. Spreading that
 * guard across the call sites only takes one omission to undo: an abandoned
 * launch keeps running until its next network hop rejects, and an action on a
 * destroyed mobx-state-tree node throws where nothing is catching.
 */
export interface LaunchScope {
    /** aborts when the user cancels, and when the view is destroyed */
    signal: AbortSignal;
    act: (fn: () => void) => void;
    onProgress: (arg: string) => void;
    /** the EBI job id, published before the first poll so the view can link out */
    onRid: (arg: string) => void;
}
interface LaunchedData {
    msa: string;
    /** empty when the aligner built no tree, and one is then built in the browser */
    tree: string;
    treeMetadata: string;
}
/**
 * Run one launch attempt, owning the AbortController that ties it to the view.
 *
 * The controller lives on the model because two things end a launch and neither
 * is here: the Cancel button, and the disposer `afterCreate` registers. A launch
 * already holding it is aborted first, so a re-fired autorun replaces the
 * attempt rather than orphaning one that nothing can cancel.
 *
 * Runs untracked: it is called from the launch autoruns, and whatever the
 * launch body reads before its first await would otherwise become a reason to
 * launch again.
 */
export declare function runLaunch(args: {
    self: JBrowsePluginMsaViewModel;
    message: string;
    launch: (scope: LaunchScope) => Promise<LaunchedData>;
    onLaunched: () => void;
}): void;
export {};
