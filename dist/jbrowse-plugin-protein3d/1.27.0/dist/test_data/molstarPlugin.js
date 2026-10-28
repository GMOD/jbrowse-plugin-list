import { caOnlyMmcif } from './molstarStructure';
import { POCKET_MMCIF, shiftedPocket } from './pocketStructure';
import { loadStructure } from '../ProteinView/structurePipeline';
/** Load a CA-only mmCIF into a headless plugin the way the view loads one.
 * Needs the jsdom environment: Mol*'s layout listens on `document`. */
export async function loadCaOnly(plugin, chains, options) {
    return loadStructure({
        plugin,
        data: caOnlyMmcif(chains, options),
        assembly: options?.assembly,
        chains: options?.drawChains,
        filter: options?.filter,
    });
}
/** The 6OIM pocket (see pocketStructure), loaded the way the view loads one. */
export async function loadPocket(plugin, dx = 0) {
    const { structures } = await loadStructure({
        plugin,
        data: dx === 0 ? POCKET_MMCIF : shiftedPocket(dx),
    });
    const [structure] = structures;
    if (!structure) {
        throw new Error('the pocket did not load');
    }
    return { structure, structures };
}
