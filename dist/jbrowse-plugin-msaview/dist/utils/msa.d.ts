export declare function launchMSA({ algorithm, sequence, onProgress, }: {
    algorithm: string;
    sequence: string;
    onProgress: (arg: string) => void;
}): Promise<{
    msa: string;
    tree: string;
}>;
