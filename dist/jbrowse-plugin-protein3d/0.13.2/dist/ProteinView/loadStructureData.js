import { extractEntities, extractPerResidueConfidence } from 'p2s_mapper';
import loadMolstar from './loadMolstar';
import { loadStructure } from './structurePipeline';
/**
 * Loads a structure (from inline data or a URL) into the given Molstar plugin
 * and pulls out its per-chain sequences and per-residue confidence. Pure with
 * respect to the model — it only touches the plugin and returns plain data, so
 * callers own the decision of whether/where to store the result.
 */
export async function loadStructureData({ structure, plugin, }) {
    const { data, url } = structure;
    const { model, structures: molstarStructures, modelIds, } = data || url
        ? await loadStructure({ plugin, data: data || undefined, url })
        : { model: undefined, structures: [], modelIds: [] };
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
        molstarStructures,
        modelIds,
    };
}
