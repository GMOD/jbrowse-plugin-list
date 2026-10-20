import { extractEntities, extractPerResidueConfidence } from 'p2s_mapper';
import loadMolstar from './loadMolstar';
import { loadStructure } from './structurePipeline';
function pdbExperimentalMethods(source, { PdbFormat }) {
    if (!PdbFormat.is(source)) {
        return [];
    }
    const { data, indices, count } = source.data.lines;
    const methods = [];
    for (let i = 0; i < count; i++) {
        const line = data.substring(indices[2 * i], indices[2 * i + 1]);
        if (line.startsWith('EXPDTA')) {
            methods.push(...line.slice(10).split(';'));
        }
        else if (line.startsWith('ATOM') || line.startsWith('HETATM')) {
            break;
        }
    }
    return methods.map(m => m.trim()).filter(m => m !== '');
}
// Mol* converts a PDB file to mmCIF without filling `exptl`, so its method is
// read from the EXPDTA records of the file it kept.
function experimentalMethods(source, molstar) {
    if (!source || !molstar.MmcifFormat.is(source)) {
        return [];
    }
    const { db, source: original } = source.data;
    return [
        ...Array.from(db.exptl.method.toArray()),
        ...(original ? pdbExperimentalMethods(original, molstar) : []),
    ];
}
/**
 * Loads a structure (from inline data or a URL) into the given Molstar plugin
 * and pulls out its per-chain sequences and per-residue confidence. Pure with
 * respect to the model — it only touches the plugin and returns plain data, so
 * callers own the decision of whether/where to store the result.
 */
export async function loadStructureData({ structure, plugin, }) {
    const { data, url } = structure;
    const { model, structures: molstarStructures, modelIds, } = await loadStructure({ plugin, data: data || undefined, url });
    // An experimental entry's B-factors are not confidence: read as pLDDT they
    // invert, drawing a well-ordered residue as "very low".
    const experimental = experimentalMethods(model?.obj?.data.sourceData, await loadMolstar()).some(m => m !== 'THEORETICAL MODEL');
    return {
        entities: model ? extractEntities(model) : undefined,
        confidence: model && !experimental ? extractPerResidueConfidence(model) : undefined,
        molstarStructures,
        modelIds,
    };
}
