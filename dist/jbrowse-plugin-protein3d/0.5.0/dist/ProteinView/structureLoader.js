import { isAlive } from '@jbrowse/mobx-state-tree';
import { loadStructureData } from './loadStructureData';
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
export function makeStructureLoader(host) {
    const loadingStructures = new Set();
    function loadInto(structure, plugin) {
        loadingStructures.add(structure);
        loadStructureData({ structure, plugin })
            .then(data => {
            const current = isAlive(structure)
                ? host.molstarPluginContext
                : undefined;
            if (current === plugin) {
                structure.setStructureData(data);
                structure.setLoadedToMolstar(true);
            }
            loadingStructures.delete(structure);
            if (current && current !== plugin && !structure.loadedToMolstar) {
                loadInto(structure, current);
            }
        })
            .catch((e) => {
            loadingStructures.delete(structure);
            if (isAlive(host)) {
                host.setError(e);
                console.error(e);
            }
        });
    }
    return function loadPendingStructures() {
        const { structures, molstarPluginContext } = host;
        if (molstarPluginContext) {
            for (const structure of structures) {
                if (!structure.loadedToMolstar && !loadingStructures.has(structure)) {
                    loadInto(structure, molstarPluginContext);
                }
            }
        }
    };
}
