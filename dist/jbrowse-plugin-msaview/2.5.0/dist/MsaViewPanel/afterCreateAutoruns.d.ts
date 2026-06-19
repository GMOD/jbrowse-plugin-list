import type { JBrowsePluginMsaViewModel } from './model';
export declare function loadStoredData(self: JBrowsePluginMsaViewModel): void;
export declare function storeDataToIndexedDB(self: JBrowsePluginMsaViewModel): void;
export declare function launchBlastIfNeeded(self: JBrowsePluginMsaViewModel): void;
export declare function processInit(self: JBrowsePluginMsaViewModel): void;
/**
 * Mirror the connected genome view's hover position onto the MSA's hovered
 * column. Returns the autorun body so it can keep a flag tracking whether the
 * MSA's mouseCol was set by this sync: that way an unrelated session hover
 * change clears the column only when the genome put it there, never wiping a
 * column the user is hovering directly in the MSA.
 */
export declare function syncGenomeHoverToMsaColumn(self: JBrowsePluginMsaViewModel): () => void;
export declare function highlightConnectedStructures(self: JBrowsePluginMsaViewModel): void;
export declare function autoConnectStructures(self: JBrowsePluginMsaViewModel): void;
export declare function observeProteinHighlights(self: JBrowsePluginMsaViewModel): void;
export declare function runCleanup(): void;
