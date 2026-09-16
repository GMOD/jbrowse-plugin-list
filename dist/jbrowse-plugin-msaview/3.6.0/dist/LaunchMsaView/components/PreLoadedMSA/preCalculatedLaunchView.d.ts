import type { Feature } from '@jbrowse/core/util';
import type { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view';
export declare function preCalculatedLaunchView({ newViewTitle, view, feature, data, querySeqName, querySeqOffset, }: {
    data: {
        msa: string;
    };
    newViewTitle: string;
    view: LinearGenomeViewModel;
    feature: Feature;
    querySeqName: string;
    /** transcript residues before the query row's first residue */
    querySeqOffset?: number;
}): void;
