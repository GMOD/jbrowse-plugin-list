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
function oligomericDetails(model, { MmcifFormat }) {
    const source = model.sourceData;
    if (!MmcifFormat.is(source)) {
        return new Map();
    }
    const { id, oligomeric_details, _rowCount } = source.data.db.pdbx_struct_assembly;
    const details = new Map();
    for (let i = 0; i < _rowCount; i++) {
        const value = oligomeric_details.value(i);
        if (value) {
            details.set(id.value(i), value);
        }
    }
    return details;
}
function structureAssemblies(model, molstar) {
    const details = oligomericDetails(model, molstar);
    const chains = new Set(Array.from(model.atomicHierarchy.chains.label_asym_id.toArray()));
    return (molstar.ModelSymmetry.Provider.get(model)?.assemblies ?? []).map(({ id, operatorGroups }) => {
        const [group, ...rest] = operatorGroups;
        const asymIds = new Set(group?.asymIds ?? chains);
        return {
            id,
            oligomericDetails: details.get(id),
            wholeModel: rest.length === 0 &&
                group?.operators.length === 1 &&
                group.operators[0].isIdentity &&
                [...chains].every(c => asymIds.has(c)),
        };
    });
}
/**
 * Loads a structure (from inline data or a URL) into the given Molstar plugin
 * and pulls out its per-chain sequences and per-residue confidence. Pure with
 * respect to the model — it only touches the plugin and returns plain data, so
 * callers own the decision of whether/where to store the result.
 */
export async function loadStructureData({ structure, plugin, }) {
    const { data, url, assembly } = structure;
    const { model, structures: molstarStructures, modelIds, } = await loadStructure({ plugin, data: data || undefined, url, assembly });
    const molstar = await loadMolstar();
    // An experimental entry's B-factors are not confidence: read as pLDDT they
    // invert, drawing a well-ordered residue as "very low".
    const experimental = experimentalMethods(model?.obj?.data.sourceData, molstar).some(m => m !== 'THEORETICAL MODEL');
    return {
        entities: model ? extractEntities(model) : undefined,
        confidence: model && !experimental ? extractPerResidueConfidence(model) : undefined,
        molstarStructures,
        modelIds,
        assemblies: model?.obj ? structureAssemblies(model.obj.data, molstar) : [],
        assembly,
    };
}
