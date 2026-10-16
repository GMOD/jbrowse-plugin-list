import { isAlive } from '@jbrowse/mobx-state-tree';
import { superposeStructures } from './superposeStructures';
/**
 * Builds the body of the autorun that keeps Molstar's structures superposed.
 *
 * Superposition is a pure function of which structures are loaded into the
 * current plugin, so it is modeled as a reaction rather than triggered
 * imperatively when a structure is added. That keeps a single loading path (the
 * structure loader). The body reads its observable dependencies synchronously
 * (MobX only tracks reads before the first `await`) and dispatches one guarded,
 * fire-and-forget run:
 *
 *   - a non-observable in-flight flag serializes runs so overlapping molstar
 *     state mutations can't interleave;
 *   - `superposedCount`, the loads it covered and `superposedPlugin` remember
 *     the last alignment, so a run only happens when the loaded set changes or
 *     the plugin is swapped, not on every reaction. The loads are compared by
 *     identity, since a removal and a load during a run leave the count where
 *     it was;
 *   - after a run finishes it re-checks, because the loaded set may have grown
 *     (or the plugin been swapped) while it was aligning;
 *   - every observable is read before the in-flight check, so a reset that
 *     lands mid-run (Re-align, a removal) is still tracked, and the run leaves
 *     a reset count alone rather than overwriting it.
 */
export function makeStructureSuperposer(host) {
    let superposing = false;
    let superposedPlugin;
    let superposedLoads = [];
    function run() {
        const { molstarPluginContext: plugin, structures } = host;
        const loads = structures
            .filter(s => s.loadedToMolstar)
            .map(s => s.molstarStructures);
        const loadedCount = loads.length;
        if (plugin !== superposedPlugin) {
            superposedPlugin = plugin;
            host.setSuperposedCount(0);
        }
        const startCount = host.superposedCount;
        const changed = loadedCount !== startCount ||
            loads.some((load, i) => load !== superposedLoads[i]);
        if (plugin && !superposing && loadedCount >= 2 && changed) {
            superposing = true;
            superposeStructures(plugin, loads)
                .catch((e) => {
                console.error(e);
                if (isAlive(host) && host.molstarPluginContext === plugin) {
                    host.setError(e);
                }
            })
                .finally(() => {
                superposing = false;
                if (isAlive(host)) {
                    // a run into a plugin swapped away mid-flight covered nothing
                    if (host.molstarPluginContext === plugin &&
                        host.superposedCount === startCount) {
                        superposedLoads = loads;
                        host.setSuperposedCount(loadedCount);
                    }
                    run();
                }
            });
        }
    }
    return run;
}
