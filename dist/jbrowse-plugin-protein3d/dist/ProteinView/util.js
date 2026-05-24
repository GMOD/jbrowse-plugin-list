import loadMolstar from './loadMolstar';
export function checkHovered(hovered) {
    return (!!hovered &&
        typeof hovered === 'object' &&
        'hoverPosition' in hovered &&
        !!hovered.hoverPosition &&
        typeof hovered.hoverPosition === 'object' &&
        'coord' in hovered.hoverPosition &&
        'refName' in hovered.hoverPosition);
}
export async function getMolstarStructureSelection({ structure, selectedResidue, }) {
    const { Script } = await loadMolstar();
    return Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
        'residue-test': Q.core.rel.eq([
            Q.struct.atomProperty.macromolecular.label_seq_id(),
            selectedResidue,
        ]),
        'group-by': Q.struct.atomProperty.macromolecular.residueKey(),
    }), structure);
}
export function invertMap(arg) {
    return Object.fromEntries(Object.entries(arg).map(([a, b]) => [b, +a]));
}
