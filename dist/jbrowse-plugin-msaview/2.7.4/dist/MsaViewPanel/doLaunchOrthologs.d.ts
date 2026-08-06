import type { JBrowsePluginMsaViewModel } from './model';
/**
 * The no-search-job alternative to doLaunchBlast.
 *
 * BLAST spends 10+ minutes answering "what looks like this sequence" and
 * returns a redundant, accession-labelled hit list. This asks NCBI the question
 * the alignment actually wants — "what is this gene's ortholog in each species"
 * — which NCBI has already computed, so the whole NCBI half returns in about a
 * second and only the EBI alignment (~10s) costs real time.
 *
 * The query row is the user's OWN selected transcript, not NCBI's
 * representative protein for the query species, because `connectedFeature`
 * maps genome coordinates through that row — swapping in a different isoform
 * would silently break the genome<->MSA linkage. The query species is therefore
 * excluded from the ortholog set rather than appearing twice.
 */
export declare function doLaunchOrthologs({ self, }: {
    self: JBrowsePluginMsaViewModel;
}): Promise<{
    treeMetadata: string;
    msa: string;
    tree: string;
}>;
