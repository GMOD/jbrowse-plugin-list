import type { JBrowsePluginMsaViewModel } from './model';
export declare function loadStoredData(self: JBrowsePluginMsaViewModel): void;
export declare function storeDataToIndexedDB(self: JBrowsePluginMsaViewModel): void;
export declare function launchBlastIfNeeded(self: JBrowsePluginMsaViewModel): void;
/**
 * Once an accession-bearing alignment is present (fresh from BLAST or restored
 * from cache), fetch NCBI CDD domains for those accessions and overlay them.
 * Runs once per view; the domainsRequested guard prevents refiring when NCBI
 * returns no domains (which leaves interProAnnotations undefined).
 */
export declare function autoLoadProteinDomains(self: JBrowsePluginMsaViewModel): void;
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
/**
 * Mirror a connected 3D protein view's hovered residue onto the MSA's
 * highlighted columns. Returns the autorun body and keeps a flag tracking
 * whether the current highlight was set by THIS sync: when a protein hover ends
 * we restore the declarative highlightColumns seed (or clear) rather than
 * blindly wiping it.
 *
 * Without the flag this autorun fires once on creation — with the view connected
 * to a *genome* LGV but no 3D protein structure attached — computes zero columns,
 * and calls setHighlightedColumns(undefined), clobbering the seed that
 * MSAModelF.afterCreate just set from the declarative `highlightColumns`. That is
 * the bug that made the BRAF/TP53 genome-browser links open with no V600/R248
 * column lit (SRC has no highlightColumns, so nothing was there to wipe).
 */
export declare function observeProteinHighlights(self: JBrowsePluginMsaViewModel): () => void;
export declare function runCleanup(): void;
