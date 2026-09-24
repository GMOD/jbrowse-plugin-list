import type { JBrowsePluginMsaViewModel } from './model';
import type { LaunchScope } from './runLaunch';
/**
 * The no-search-job alternative to doLaunchBlast.
 *
 * BLAST spends 10+ minutes answering "what looks like this sequence" and
 * returns a redundant, accession-labelled hit list. This asks the question the
 * alignment actually wants — "what is this gene's ortholog in each species" —
 * which NCBI and PANTHER have already computed, so the lookup returns in
 * seconds and only the EBI alignment (~10s) costs real time. `source` picks
 * which of the two answers: NCBI for vertebrates and insects, PANTHER for
 * everything else (yeast, worm, plants, and a fly gene's vertebrate relatives).
 *
 * The query row is the user's OWN selected transcript, not the source's
 * representative protein for the query species, because `connectedFeature`
 * maps genome coordinates through that row — swapping in a different isoform
 * would silently break the genome<->MSA linkage. The query species is therefore
 * excluded from the ortholog set rather than appearing twice.
 */
export declare function doLaunchOrthologs({ self, scope, }: {
    self: JBrowsePluginMsaViewModel;
    scope: LaunchScope;
}): Promise<{
    treeMetadata: string;
    msa: string;
    tree: string;
}>;
