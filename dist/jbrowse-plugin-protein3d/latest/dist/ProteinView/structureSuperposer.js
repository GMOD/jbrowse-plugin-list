import { isAlive } from '@jbrowse/mobx-state-tree';
import { reportPluginFailure } from './reportPluginFailure';
import { superposeStructures } from './superposeStructures';
function superposedLoad(s) {
    const entity = s.mappedEntity;
    const map = s.coordinateMapper?.maps.structureSeqToTranscriptSeqPosition;
    return {
        label: s.label,
        structures: s.molstarStructures,
        mapping: entity && map
            ? {
                entityId: entity.entityId,
                residues: new Map(Object.entries(map).flatMap(([pos, transcript]) => {
                    const i = Number(pos);
                    const seqId = entity.seqIds[i];
                    const code = entity.seq[i];
                    return seqId === undefined || code === undefined
                        ? []
                        : [[seqId, { transcript, code }]];
                })),
                drawnChains: s.chains,
            }
            : undefined,
    };
}
// what a superposition of `s` depends on: its Mol* structures, and the chain
// and alignment that pick the copy it aligns by
function loadKey(s) {
    return [s.molstarStructures, s.mappedEntity?.entityId, s.pairwiseAlignment];
}
function sameKeys(a, b) {
    return (a.length === b.length &&
        a.every((key, i) => key.every((part, j) => part === b[i]?.[j])));
}
/**
 * Builds the body of the autorun that keeps Molstar's structures superposed.
 *
 * Superposition is a pure function of which structures are loaded into the
 * current plugin and the chain each maps, so it is modeled as a reaction
 * rather than triggered imperatively when a structure is added. That keeps a
 * single loading path (the structure loader). The body reads its observable
 * dependencies synchronously (MobX only tracks reads before the first
 * `await`) and dispatches one guarded, fire-and-forget run:
 *
 *   - it waits for every loaded structure's alignment, which says which chain
 *     to align by and which residues pair, so a structure is moved once
 *     rather than by its whole contents and again by its chain;
 *   - a non-observable in-flight flag serializes runs so overlapping molstar
 *     state mutations can't interleave;
 *   - `superposedCount`, the keys of the loads it covered and
 *     `superposedPlugin` remember the last alignment, so a run only happens
 *     when the loaded set, a mapped chain or the plugin changes, not on every
 *     reaction. The loads are compared by identity, since a removal and a
 *     load during a run leave the count where it was;
 *   - after a run finishes it re-checks, because the loaded set may have grown
 *     (or the plugin been swapped) while it was aligning;
 *   - every observable is read before the in-flight check, so a reset that
 *     lands mid-run (Re-align, a removal) is still tracked, and the run leaves
 *     a reset count alone rather than overwriting it.
 */
export function makeStructureSuperposer(host) {
    let superposing = false;
    let superposedPlugin;
    let superposedKeys = [];
    function run() {
        const { molstarPluginContext: plugin, structures } = host;
        const loaded = structures.filter(s => s.loadedToMolstar);
        const keys = loaded.map(loadKey);
        const mapped = loaded.every(s => !s.alignmentPending || s.error !== undefined);
        const loads = mapped ? loaded.map(superposedLoad) : [];
        const loadedCount = loaded.length;
        if (plugin !== superposedPlugin) {
            superposedPlugin = plugin;
            host.setSuperposedCount(0);
        }
        const startCount = host.superposedCount;
        const changed = loadedCount !== startCount || !sameKeys(keys, superposedKeys);
        if (loadedCount < 2) {
            for (const s of loaded) {
                s.setSuperposition(undefined);
            }
        }
        if (plugin && !superposing && mapped && loadedCount >= 2 && changed) {
            superposing = true;
            superposeStructures(plugin, loads)
                .then(outcomes => {
                if (host.molstarPluginContext === plugin) {
                    loaded.forEach((s, i) => {
                        if (isAlive(s)) {
                            s.setSuperposition(outcomes[i]);
                        }
                    });
                }
            })
                .catch(reportPluginFailure(host, plugin))
                .finally(() => {
                superposing = false;
                if (isAlive(host)) {
                    // a run into a plugin swapped away mid-flight covered nothing
                    if (host.molstarPluginContext === plugin &&
                        host.superposedCount === startCount) {
                        superposedKeys = keys;
                        host.setSuperposedCount(loadedCount);
                    }
                    run();
                }
            });
        }
    }
    return run;
}
