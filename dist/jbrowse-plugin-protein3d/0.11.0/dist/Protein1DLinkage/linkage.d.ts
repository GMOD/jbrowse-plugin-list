import type { SimpleFeatureSerialized } from '@jbrowse/core/util';
/**
 * What ties a 1D protein-annotation genome view back to the transcript it was
 * launched from. Stored on the view itself (see index.ts) so it rides along in
 * the session snapshot; a module-level registry used to hold it and every
 * reload, share link or restore lost the hover link while both views came
 * back.
 */
export interface Protein1DLinkage {
    connectedViewId: string;
    feature: SimpleFeatureSerialized;
    uniprotId: string;
}
export declare function getProteinLinkage(view: unknown): Protein1DLinkage | undefined;
/** The 1D view showing this UniProt entry, if one is open. */
export declare function findProteinLinkedView(session: {
    views: {
        id: string;
    }[];
}, uniprotId: string): {
    id: string;
} | undefined;
export declare function linkageGenomeMapping(linkage: Protein1DLinkage): {
    g2p: Record<number, number>;
    p2g: Record<number, number>;
    p2gCodon: Record<number, number[]>;
    refName: string;
    strand: number;
};
export declare function genomeHighlightForProteinPosition(linkage: Protein1DLinkage, proteinPos: number): {
    refName: string;
    start: number;
    end: number;
} | undefined;
