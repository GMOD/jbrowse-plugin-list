import { Feature } from '@jbrowse/core/util';
import type { JBrowsePluginMsaViewModel } from '../../../MsaViewPanel/model';
import type { CachedBlastResult } from '../../../utils/blastCache';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
export declare function blastLaunchView({ newViewTitle, view, feature, blastParams, }: {
    newViewTitle: string;
    view: LinearGenomeViewModel;
    feature: Feature;
    blastParams: Record<string, unknown>;
}): JBrowsePluginMsaViewModel;
export declare function blastLaunchViewFromCache({ newViewTitle, view, cached, }: {
    newViewTitle: string;
    view: LinearGenomeViewModel;
    cached: CachedBlastResult;
}): JBrowsePluginMsaViewModel;
