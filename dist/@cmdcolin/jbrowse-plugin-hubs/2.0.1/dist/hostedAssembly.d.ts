export interface HubAssembly extends Record<string, unknown> {
    name: string;
    aliases?: string[];
}
export interface HubConfig extends Record<string, unknown> {
    assemblies?: HubAssembly[];
    tracks?: {
        trackId: string;
        adapter?: Record<string, unknown>;
    }[];
}
export declare function hostedAssemblyFromConfig(config: HubConfig, assemblyName: string, configUrl: string): {
    configUrl: string;
    assembly: HubAssembly;
    geneAdapter: Record<string, unknown> | undefined;
} | undefined;
export declare function findHostedAssembly(assemblyName: string): Promise<{
    configUrl: string;
    assembly: HubAssembly;
    geneAdapter: Record<string, unknown> | undefined;
} | undefined>;
