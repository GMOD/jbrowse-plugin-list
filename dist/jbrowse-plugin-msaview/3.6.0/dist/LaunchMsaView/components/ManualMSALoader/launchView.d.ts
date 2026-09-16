import type { Feature, FileLocation } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
export declare function launchView({ newViewTitle, view, feature, msaFilehandle, treeFilehandle, querySeqName, querySeqOffset, data, }: {
    newViewTitle: string;
    view: LinearGenomeViewModel;
    feature: Feature;
    msaFilehandle?: FileLocation;
    treeFilehandle?: FileLocation;
    querySeqName?: string;
    /** transcript residues before the query row's first residue */
    querySeqOffset?: number;
    data?: {
        msa: string;
        tree?: string;
    };
}): void;
