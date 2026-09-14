import { addStructureFromData } from './addStructureFromData';
import { addStructureFromURL } from './addStructureFromURL';
import { extractPerResidueConfidence } from './extractPerResidueConfidence';
import { extractEntities } from './extractStructureSequences';
import loadMolstar from './loadMolstar';
/**
 * Loads a structure (from inline data or a URL) into the given Molstar plugin
 * and pulls out its per-chain sequences and per-residue confidence. Pure with
 * respect to the model — it only touches the plugin and returns plain data, so
 * callers own the decision of whether/where to store the result.
 */
export async function loadStructureData({ structure, plugin, }) {
    const { model, structure: molstarStructure, modelIds, } = structure.data
        ? await addStructureFromData({ data: structure.data, plugin })
        : structure.url
            ? await addStructureFromURL({ url: structure.url, plugin })
            : { model: undefined, structure: undefined, modelIds: [] };
    // An experimental entry's B-factors are not confidence: read as pLDDT they
    // invert, drawing a well-ordered residue as "very low".
    const { MmcifFormat } = await loadMolstar();
    const source = model?.obj?.data.sourceData;
    const methods = source && MmcifFormat.is(source)
        ? Array.from(source.data.db.exptl.method.toArray())
        : [];
    const experimental = methods.some(m => m !== 'THEORETICAL MODEL');
    return {
        entities: model ? extractEntities(model) : undefined,
        confidence: model && !experimental ? extractPerResidueConfidence(model) : undefined,
        molstarStructure,
        modelIds,
    };
}
