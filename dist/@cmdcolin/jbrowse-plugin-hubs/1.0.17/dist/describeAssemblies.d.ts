interface Description {
    assembly: HubAssembly;
    geneAdapter?: Record<string, unknown>;
}
interface HubAssembly {
    name: string;
    aliases?: string[];
}
interface HubConfig {
    assemblies?: HubAssembly[];
    tracks?: {
        trackId: string;
        adapter?: Record<string, unknown>;
    }[];
}
export declare function describeFromConfig(config: HubConfig, assemblyName: string, configUrl: string): Description | undefined;
/**
 * Core-describeAssemblies: the assembly config and gene track adapter the
 * hosted config of each named genome holds, read without connecting it. A
 * name another plugin already described, or one no hosted config could hold,
 * is left alone
 */
export declare function describeAssemblies(described: unknown, assemblyNames: unknown): Promise<{
    [k: string]: Description | undefined;
}>;
export {};
