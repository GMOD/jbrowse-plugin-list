import { isAlive } from '@jbrowse/mobx-state-tree';
import { superposeStructures } from './superposeStructures';
/**
 * Builds the body of the autorun that keeps Molstar's structures superposed.
 *
 * Superposition is a pure function of which structures are loaded into the
 * current plugin, so it is modeled as a reaction rather than triggered
 * imperatively when a structure is added. That keeps a single loading path (the
 * structure loader) and means a failed load is retried by the loader instead of
 * being stranded. The body reads its observable dependencies synchronously
 * (MobX only tracks reads before the first `await`) and dispatches one guarded,
 * fire-and-forget run:
 *
 *   - a non-observable in-flight flag serializes runs so overlapping molstar
 *     state mutations can't interleave;
 *   - `superposedCount`/`superposedPlugin` remember the last alignment, so a run
 *     only happens when the loaded set grows or the plugin is swapped, not on
 *     every reaction;
 *   - after a run finishes it re-checks, because the loaded set may have grown
 *     (or the plugin been swapped) while it was aligning.
 */
export function makeStructureSuperposer(host) {
    let superposing = false;
    let superposedPlugin;
    function run() {
        const { molstarPluginContext: plugin, structures } = host;
        const loaded = structures.filter(s => s.loadedToMolstar);
        const loadedCount = loaded.length;
        if (plugin !== superposedPlugin) {
            superposedPlugin = plugin;
            host.setSuperposedCount(0);
        }
        if (plugin &&
            !superposing &&
            loadedCount >= 2 &&
            loadedCount !== host.superposedCount) {
            superposing = true;
            superposeStructures(plugin, loaded.map(s => s.molstarStructures))
                .catch((e) => {
                if (isAlive(host)) {
                    host.setError(e);
                    console.error(e);
                }
            })
                .finally(() => {
                superposing = false;
                if (isAlive(host)) {
                    // a run into a plugin swapped away mid-flight covered nothing
                    if (host.molstarPluginContext === plugin) {
                        host.setSuperposedCount(loadedCount);
                    }
                    run();
                }
            });
        }
    }
    return run;
}
