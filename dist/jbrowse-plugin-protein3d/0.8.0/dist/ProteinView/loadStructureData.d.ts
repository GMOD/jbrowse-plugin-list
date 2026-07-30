import type { Entity } from './extractStructureSequences';
import type { PluginContext } from 'molstar/lib/mol-plugin/context';
export interface StructureData {
    entities?: Entity[];
    confidence?: number[];
}
/**
 * Loads a structure (from inline data or a URL) into the given Molstar plugin
 * and pulls out its per-chain sequences and per-residue confidence. Pure with
 * respect to the model — it only touches the plugin and returns plain data, so
 * callers own the decision of whether/where to store the result.
 */
export declare function loadStructureData({ structure, plugin, }: {
    structure: {
        data?: string;
        url?: string;
    };
    plugin: PluginContext;
}): Promise<StructureData>;
