import type { JBrowsePluginMsaViewModel } from './model';
/**
 * Resolve `connectedTranscript` into `connectedFeature` once the connected
 * genome view has its assembly, regions and tracks, then hand the translation
 * to whichever launch is waiting for a query. Left in place on failure so the
 * error stays attributable; the autorun's tracked reads are the view's
 * readiness, so nothing refires until that changes.
 */
export declare function resolveConnectedTranscriptIfNeeded(self: JBrowsePluginMsaViewModel): void;
