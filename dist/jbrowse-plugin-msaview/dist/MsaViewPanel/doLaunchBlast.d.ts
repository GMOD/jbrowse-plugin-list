import { JBrowsePluginMsaViewModel } from './model';
export declare function doLaunchBlast({ self, }: {
    self: JBrowsePluginMsaViewModel;
}): Promise<{
    treeMetadata: string;
    msa: string;
    tree: string;
}>;
