import type { BlastParams } from '../../../MsaViewPanel/model';
import type { CachedBlastResult } from '../../../utils/blastCache';
import type { Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
export declare function blastLaunchView({ newViewTitle, view, feature, blastParams, }: {
    newViewTitle: string;
    view: LinearGenomeViewModel;
    feature: Feature;
    blastParams: BlastParams;
}): void;
export declare function blastLaunchViewFromCache({ newViewTitle, view, cached, }: {
    newViewTitle: string;
    view: LinearGenomeViewModel;
    cached: CachedBlastResult;
}): void;
