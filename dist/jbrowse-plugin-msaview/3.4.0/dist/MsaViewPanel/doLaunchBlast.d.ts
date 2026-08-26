import type { JBrowsePluginMsaViewModel } from './model';
export declare function doLaunchBlast({ self, }: {
    self: JBrowsePluginMsaViewModel;
}): Promise<{
    msa: string;
    tree: string;
    treeMetadata: string;
}>;
