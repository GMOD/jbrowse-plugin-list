import type { MsaAlgorithm } from '../LaunchMsaView/components/NCBIBlastQuery/consts';
export declare function launchMSA({ algorithm, sequence, onProgress, }: {
    algorithm: MsaAlgorithm;
    sequence: string;
    onProgress: (arg: string) => void;
}): Promise<{
    msa: string;
    tree: string;
}>;
