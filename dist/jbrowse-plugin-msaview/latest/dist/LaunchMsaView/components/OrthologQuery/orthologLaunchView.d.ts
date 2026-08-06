import type { OrthologParams } from '../../../MsaViewPanel/model';
import type { Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
export declare function orthologLaunchView({ newViewTitle, view, feature, orthologParams, }: {
    newViewTitle: string;
    view: LinearGenomeViewModel;
    feature: Feature;
    orthologParams: OrthologParams;
}): void;
