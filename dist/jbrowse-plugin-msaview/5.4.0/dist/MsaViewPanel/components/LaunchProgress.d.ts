import React from 'react';
import type { JBrowsePluginMsaViewModel } from '../model';
/**
 * What a view shows while it is still building its alignment, and what it shows
 * when that fails.
 *
 * Every launch that resolves something states its request on the model --
 * `blastParams`, `orthologParams`, `init` -- and one not yet marked
 * `launchCompleted` IS "no alignment yet", as is a completed one whose stored
 * alignment has since expired. The error a failed launch records is only
 * readable here. This used to key on `blastParams` alone, which left an ortholog
 * launch rendering an empty MSAView for the minutes its alignment takes and, on
 * failure, forever: the error was set and nothing drew it.
 */
declare const LaunchProgress: ({ model, }: {
    model: JBrowsePluginMsaViewModel;
}) => React.JSX.Element;
export default LaunchProgress;
