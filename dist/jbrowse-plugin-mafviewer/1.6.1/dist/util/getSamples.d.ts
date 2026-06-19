export declare function getSamplesFromConfig(getConf: (key: string) => unknown): Promise<{
    samples: {
        id: string;
        label?: string;
        color?: string;
    }[];
    tree: Record<string, any> | undefined;
}>;
