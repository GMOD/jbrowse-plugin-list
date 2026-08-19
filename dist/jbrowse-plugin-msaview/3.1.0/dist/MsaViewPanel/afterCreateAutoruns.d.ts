import type { JBrowsePluginMsaViewModel } from './model';
export declare function loadStoredData(self: JBrowsePluginMsaViewModel): void;
export declare function storeDataToIndexedDB(self: JBrowsePluginMsaViewModel): void;
/**
 * Same shape as launchBlastIfNeeded, for the ortholog path: the params ARE the
 * request, and clearing them on success is what marks it done. They are left in
 * place on failure so the error stays attributable to a specific request; the
 * autorun's only tracked read is orthologParams itself, so nothing refires
 * until a new request replaces them.
 */
export declare function launchOrthologsIfNeeded(self: JBrowsePluginMsaViewModel): void;
export declare function launchBlastIfNeeded(self: JBrowsePluginMsaViewModel): void;
/**
 * Once an accession-bearing alignment is present (fresh from BLAST or restored
 * from cache), fetch NCBI CDD domains for those accessions and overlay them.
 * Runs once per view; the domainsRequested guard prevents refiring when NCBI
 * returns no domains (which leaves the annotation list empty).
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
/**
 * Mirror a connected 3D protein view's highlights onto the MSA's highlighted
 * columns, from either of the two channels protein3d publishes:
 *
 * - `hoverGenomeHighlights` — the residue under the pointer, transient.
 * - `clickGenomeHighlights` — the domain the user clicked, persistent. Also
 *   what protein3d's declarative `initialSelection` lights on load, so a session
 *   spec that pre-selects a domain in the structure now lands in the alignment
 *   too, instead of the caller having to author the same range a second time as
 *   the MSA's own `highlightColumns`.
 *
 * Highest-priority non-empty source wins: a hover reads as a transient probe on
 * top of the standing selection, and letting it win means moving the pointer
 * over the structure previews a residue without destroying what was selected.
 * Releasing the hover falls back to the click selection, then to the declarative
 * `highlightColumns` seed.
 *
 * Resolving the seed as the last rung of that stack is what replaced a
 * `proteinDriven` flag this function used to carry. The flag existed because the
 * body could not otherwise tell "no protein highlight, leave the seed alone"
 * from "the protein highlight ended, restore the seed", and getting that wrong
 * wiped the seed on the very first run — the bug that made the BRAF/TP53
 * genome-browser links open with no V600/R248 column lit. Now every source is in
 * one expression, so the result depends only on what the sources currently say
 * and there is no ordering to get wrong.
 *
 * A closure remains, but it decides nothing: `written` only suppresses a
 * redundant redraw. Delete it and the highlight is identical, just recomputed
 * more often — where deleting the old flag changed which columns lit.
 */
export declare function observeProteinHighlights(self: JBrowsePluginMsaViewModel): () => void;
export declare function runCleanup(): void;
