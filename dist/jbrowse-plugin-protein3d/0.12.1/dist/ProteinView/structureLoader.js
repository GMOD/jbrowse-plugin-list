import { isAlive } from '@jbrowse/mobx-state-tree';
import { fetchAlphaFoldModels, getAlphaFoldStructureUrl, pickAlphaFoldModel, } from 'p2s_mapper';
import { loadStructureData } from './loadStructureData';
import { removeMolstarStructure } from './removeStructure';
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
export function makeStructureLoader(host, fetchModels = fetchAlphaFoldModels) {
    const loadingStructures = new Set();
    /** The accession a structure still has to turn into a file, if any. */
    function unresolvedAccession(structure) {
        const { url, data, uniprotId } = structure;
        return url === undefined && data === undefined ? uniprotId : undefined;
    }
    /**
     * Which AlphaFold file an accession opens. Asked rather than spelled: a
     * protein folded past the length cap has no F1 fragment, and the model
     * version moves, so a hardcoded name 404s. The transcript's own translation
     * goes to the picker, so an isoform AlphaFold folded exactly maps as an
     * identity.
     *
     * The two ways that can come back empty are not the same answer. An
     * unreachable API says nothing about the accession, so the spelled canonical
     * filename is worth a try — it is what this opened before it asked at all.
     * An API that answers with no models has told us there is nothing to open,
     * and spelling a filename anyway just turns that into a 404 the reader has
     * to diagnose.
     */
    async function resolveAlphaFoldUrl(structure, uniprotId) {
        const models = await fetchModels(uniprotId).catch(() => undefined);
        if (!isAlive(structure)) {
            return;
        }
        if (models === undefined) {
            structure.setUrl(getAlphaFoldStructureUrl(uniprotId));
            return;
        }
        const picked = pickAlphaFoldModel(models, {
            transcript: { seq: structure.userProvidedTranscriptSequence },
        });
        if (!picked) {
            throw new Error(`AlphaFold DB has no model for ${uniprotId}`);
        }
        structure.setUrl(picked.url);
    }
    function loadInto(structure, plugin) {
        loadingStructures.add(structure);
        // A retry — a plugin swap, a remount — starts over, so the last attempt's
        // failure goes with it. Left in place it also reported the structure as
        // settled for the whole of the retry, since `loading` reads it.
        structure.setError(undefined);
        // a structure that already knows its file dispatches synchronously, so the
        // in-flight guard covers it before the autorun body returns
        const accession = unresolvedAccession(structure);
        const loaded = accession === undefined
            ? loadStructureData({ structure, plugin })
            : resolveAlphaFoldUrl(structure, accession).then(() => loadStructureData({ structure, plugin }));
        loaded
            .then(data => {
            if (!isAlive(structure)) {
                // Removed while it was loading. The load still put a trajectory in
                // Mol*, and no model owns it any more, so it would stay on the
                // canvas and join the next superposition as a structure the view
                // does not know it has.
                loadingStructures.delete(structure);
                removeMolstarStructure({
                    plugin,
                    molstarStructure: data.molstarStructure,
                }).catch((e) => {
                    console.error(e);
                });
                return;
            }
            const current = host.molstarPluginContext;
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
            if (!isAlive(host) || !isAlive(structure)) {
                return;
            }
            const current = host.molstarPluginContext;
            if (current && current !== plugin) {
                // a plugin torn down mid-load rejects too; the structure belongs in
                // the current one, not in an error
                loadInto(structure, current);
            }
            else {
                // the structure carries its own failure: a view-wide "Failed to
                // fetch" names neither which structure nor what it was fetching
                structure.setError(e);
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
