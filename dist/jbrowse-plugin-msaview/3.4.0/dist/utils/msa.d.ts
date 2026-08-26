import type { MsaAlgorithm } from '../LaunchMsaView/components/BlastQuery/consts';
/**
 * Build a tree from an alignment that already exists, which is what the phmmer
 * path needs: phmmer produces the alignment itself, so there is no aligner run
 * to take a guide tree from — and a guide tree is a byproduct of deciding
 * progressive alignment order, not a phylogeny, so it is not what we would want
 * even if there were one. simple_phylogeny is clustalw2's neighbour-joining on
 * a real distance matrix, Kimura-corrected for protein distances.
 */
export declare function launchTree({ alignment, onProgress, }: {
    alignment: string;
    onProgress: (arg: string) => void;
}): Promise<string>;
export declare function launchMSA({ algorithm, sequence, onProgress, }: {
    algorithm: MsaAlgorithm;
    sequence: string;
    onProgress: (arg: string) => void;
}): Promise<{
    msa: string;
    tree: string;
}>;
