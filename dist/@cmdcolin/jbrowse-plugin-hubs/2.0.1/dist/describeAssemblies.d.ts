import type { AssemblyDescription } from '@jbrowse/core/PluginManager';
/**
 * Core-describeAssemblies: the assembly config and gene track adapter the
 * hosted config of each named genome holds, read without connecting it. A
 * name another plugin already described, or one no hosted config could hold,
 * is left alone
 */
export declare function describeAssemblies(described: Record<string, AssemblyDescription>, assemblyNames: string[]): Promise<{
    [x: string]: AssemblyDescription | {
        assembly: import("./hostedAssembly").HubAssembly;
        geneAdapter: Record<string, unknown> | undefined;
    };
}>;
