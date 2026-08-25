import { addStructureFromData } from './addStructureFromData';
import { addStructureFromURL } from './addStructureFromURL';
import { extractPerResidueConfidence } from './extractPerResidueConfidence';
import { extractEntities } from './extractStructureSequences';
/**
 * Loads a structure (from inline data or a URL) into the given Molstar plugin
 * and pulls out its per-chain sequences and per-residue confidence. Pure with
 * respect to the model — it only touches the plugin and returns plain data, so
 * callers own the decision of whether/where to store the result.
 */
export async function loadStructureData({ structure, plugin, }) {
    const { model, structure: molstarStructure } = structure.data
        ? await addStructureFromData({ data: structure.data, plugin })
        : structure.url
            ? await addStructureFromURL({ url: structure.url, plugin })
            : { model: undefined, structure: undefined };
    const entities = model ? extractEntities(model) : undefined;
    const first = entities?.[0];
    const values = model
        ? extractPerResidueConfidence(model, first?.seq.length)
        : undefined;
    return {
        entities,
        confidence: first && values ? { entityId: first.entityId, values } : undefined,
        molstarStructure,
    };
}
