import React from 'react';
import type { JBrowsePluginMsaViewModel } from '../model';
/**
 * What a view shows while it is still building its alignment, and what it shows
 * when that fails.
 *
 * Every launch that resolves something leaves its request on the model until it
 * succeeds -- `blastParams`, `orthologParams`, `init` -- so one still being
 * there IS "no alignment yet", and the error a failed launch records is only
 * readable here. This used to key on `blastParams` alone, which left an ortholog
 * launch rendering an empty MSAView for the minutes its alignment takes and, on
 * failure, forever: the error was set and nothing drew it.
 */
declare const LaunchProgress: ({ model, }: {
    model: JBrowsePluginMsaViewModel;
}) => React.JSX.Element;
export default LaunchProgress;
