import { placeValues } from './variantEffects';
/** A session's values by 0-based transcript position. */
export function valuesByPosition(values) {
    const byPosition = new Map();
    const entries = Array.isArray(values)
        ? values.map((v, i) => [String(i + 1), v])
        : Object.entries(values);
    for (const [residue, value] of entries) {
        if (value !== null) {
            byPosition.set(Number(residue) - 1, value);
        }
    }
    return byPosition;
}
/**
 * The residue numbers a session gives, counted on the transcript's protein,
 * placed on the mapped entity through the structure's alignment to that
 * transcript. Waits, with no message, for the alignment.
 */
export function residueValuesStatus({ values, entity, transcriptToStructure, }) {
    if (!values) {
        return { message: 'No values to color the residues by' };
    }
    if (!entity || !transcriptToStructure) {
        return {};
    }
    const placed = placeValues(valuesByPosition(values), pos => transcriptToStructure[pos], entity);
    return placed.byLabelSeqId.size > 0
        ? { placed }
        : { message: "None of the values fall on this structure's residues" };
}
