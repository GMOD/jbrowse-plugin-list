import { StructureProperties } from 'molstar/lib/mol-model/structure';
import { Color } from 'molstar/lib/mol-util/color';
import { atomicLocationReader } from './themeLocation';
export const NO_VALUE_COLOR = Color(0xcccccc);
const registry = new Map();
function schemeRegistry(scheme) {
    let byModel = registry.get(scheme);
    if (!byModel) {
        byModel = new WeakMap();
        registry.set(scheme, byModel);
    }
    return byModel;
}
export function registerPlacedValues(scheme, structure, values) {
    const byModel = schemeRegistry(scheme);
    for (const model of structure.models) {
        if (values) {
            byModel.set(model, values);
        }
        else {
            byModel.delete(model);
        }
    }
}
/**
 * Reads the value a scheme placed on the residue at a location: undefined off
 * the mapped entity, on a residue nothing placed, and on a model nobody
 * registered.
 */
export function placedValueReader(scheme, structure) {
    const atomicLocation = atomicLocationReader(structure);
    const byModel = schemeRegistry(scheme);
    return function placedValue(location) {
        const l = atomicLocation(location);
        const placed = l ? byModel.get(l.unit.model) : undefined;
        return l &&
            placed?.entityId === StructureProperties.chain.label_entity_id(l)
            ? placed.byLabelSeqId.get(StructureProperties.residue.label_seq_id(l))
            : undefined;
    };
}
