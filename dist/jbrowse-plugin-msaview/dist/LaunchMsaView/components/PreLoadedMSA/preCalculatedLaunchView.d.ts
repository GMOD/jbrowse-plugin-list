import { AbstractSessionModel, Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
export declare function preCalculatedLaunchView({ session, newViewTitle, view, feature, data, querySeqName, }: {
    data: {
        msa: string;
    };
    session: AbstractSessionModel;
    newViewTitle: string;
    view: LinearGenomeViewModel;
    feature: Feature;
    querySeqName: string;
}): void;
