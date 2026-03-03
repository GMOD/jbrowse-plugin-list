import { AbstractSessionModel, Feature, FileLocation } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
export declare function launchView({ session, newViewTitle, view, feature, msaFilehandle, treeFilehandle, querySeqName, data, }: {
    session: AbstractSessionModel;
    newViewTitle: string;
    view: LinearGenomeViewModel;
    feature: Feature;
    msaFilehandle?: FileLocation;
    treeFilehandle?: FileLocation;
    querySeqName?: string;
    data?: {
        msa: string;
        tree?: string;
    };
}): void;
