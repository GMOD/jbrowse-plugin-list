export declare function useGeneTree(geneId: string): {
    treeData: {
        geneTreeId: string;
        tree: string;
        msa: string;
        treeMetadata: string;
    } | undefined;
    isTreeLoading: boolean;
    treeError: any;
};
