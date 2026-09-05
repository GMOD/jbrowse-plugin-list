import type { JBrowsePluginMsaViewModel } from './model';
import type { LaunchScope } from './runLaunch';
export declare function doLaunchBlast({ self, scope, }: {
    self: JBrowsePluginMsaViewModel;
    scope: LaunchScope;
}): Promise<{
    msa: string;
    tree: string;
    treeMetadata: string;
}>;
