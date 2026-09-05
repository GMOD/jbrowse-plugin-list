import type StructureModel from './structureModel';
import type { IAnyStateTreeNode, Instance } from '@jbrowse/mobx-state-tree';
import type { PluginContext } from 'molstar/lib/mol-plugin/context';
type StructureInstance = Instance<typeof StructureModel>;
export type StructureLoaderHost = IAnyStateTreeNode & {
    readonly molstarPluginContext: PluginContext | undefined;
    readonly structures: StructureInstance[];
    setError: (error: unknown) => void;
};
/**
 * Builds the body of the autorun that loads structures into Molstar.
 *
 * The returned callback is synchronous on purpose: MobX only tracks
 * observables read before the first `await`, so an async autorun body would
 * stop reacting to later structures/plugin changes. Instead it reads its
 * dependencies synchronously and dispatches a guarded fire-and-forget load for
 * each structure that is neither loaded nor already loading. The guards handle
 * the lifecycle hazards of an external GPU resource:
 *
 *   - a non-observable in-flight Set stops a re-entrant run (a new structure
 *     pushed, or the plugin swapped mid-load) from starting a duplicate load of
 *     the same structure;
 *   - a load whose plugin was replaced or whose model was destroyed while
 *     awaiting has its result discarded rather than written into a torn-down
 *     plugin;
 *   - if the plugin was merely swapped (e.g. a view remount), the structure is
 *     reloaded into the current plugin so it isn't left stranded unloaded.
 */
export declare function makeStructureLoader(host: StructureLoaderHost): () => void;
export {};
