import type { AbstractSessionModel, Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
export declare function ensemblGeneTreeLaunchView({ session, newViewTitle, view, feature, data, }: {
    session: AbstractSessionModel;
    newViewTitle: string;
    view: LinearGenomeViewModel;
    feature: Feature;
    data: {
        tree: string;
        msa: string;
        treeMetadata: string;
    };
}): void;
