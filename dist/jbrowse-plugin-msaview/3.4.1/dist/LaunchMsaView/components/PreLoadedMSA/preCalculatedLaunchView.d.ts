import type { Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
export declare function preCalculatedLaunchView({ newViewTitle, view, feature, data, querySeqName, }: {
    data: {
        msa: string;
    };
    newViewTitle: string;
    view: LinearGenomeViewModel;
    feature: Feature;
    querySeqName: string;
}): void;
