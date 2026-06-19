import type { PluginContext } from 'molstar/lib/mol-plugin/context';
export declare function withTemporaryMolstarPlugin<T>(callback: (plugin: PluginContext) => Promise<T>): Promise<T>;
