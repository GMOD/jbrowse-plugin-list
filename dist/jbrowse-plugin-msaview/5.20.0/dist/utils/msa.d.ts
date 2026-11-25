import type { MsaAlgorithm } from '../LaunchMsaView/components/BlastQuery/consts';
/**
 * Align a FASTA whose first record is the query. `browser` never leaves the
 * page and returns no tree, which the launch then builds itself (see
 * runLaunch); the EBI aligners return their guide tree alongside the rows.
 */
export declare function launchMSA({ algorithm, sequence, onProgress, signal, }: {
    algorithm: MsaAlgorithm;
    sequence: string;
    onProgress: (arg: string) => void;
    signal?: AbortSignal;
}): Promise<{
    msa: string;
    tree: string;
}>;
