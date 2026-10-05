import type { JBrowsePluginMsaViewModel } from './model';
import type { LaunchScope } from './runLaunch';
/**
 * A similarity search, then an alignment of what it found. The program is a
 * backend behind one interface (utils/homologSearch.ts); what differs between
 * them is settled by whether the result came back aligned. A program that
 * aligns as it searches (phmmer) hands over the alignment and the tree is
 * built from it in the browser; one that does not (blastp) hands over bare
 * hits and the chosen aligner runs on them.
 */
export declare function doLaunchBlast({ self, scope, }: {
    self: JBrowsePluginMsaViewModel;
    scope: LaunchScope;
}): Promise<{
    msa: string;
    tree: string;
    treeMetadata: string;
}>;
