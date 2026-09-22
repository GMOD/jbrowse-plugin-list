import { caOnlyMmcif } from './molstarStructure';
import { loadStructure } from '../ProteinView/structurePipeline';
/** Load a CA-only mmCIF into a headless plugin the way the view loads one.
 * Needs the jsdom environment: Mol*'s layout listens on `document`. */
export async function loadCaOnly(plugin, chains, options) {
    return loadStructure({ plugin, data: caOnlyMmcif(chains, options) });
}
