interface Description {
    displayName?: string;
    geneAdapter?: Record<string, unknown>;
    refNameAliases?: {
        adapter: Record<string, unknown>;
    };
}
interface HubAssembly {
    name: string;
    displayName?: string;
    aliases?: string[];
    refNameAliases?: {
        adapter: Record<string, unknown>;
    };
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
 * Core-describeAssemblies: what the hosted config of each named genome says
 * of it, read without connecting it. A name another plugin already described,
 * or one no hosted config could hold, is left alone
 */
export declare function describeAssemblies(described: unknown, assemblyNames: unknown): Promise<{
    [k: string]: Description | undefined;
}>;
export {};
