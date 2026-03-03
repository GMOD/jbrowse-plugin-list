import loadMolstar from './loadMolstar';
import { proteinAbbreviationMapping } from './proteinAbbreviationMapping';
export function checkHovered(hovered) {
    return (!!hovered &&
        typeof hovered == 'object' &&
        'hoverFeature' in hovered &&
        'hoverPosition' in hovered);
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
export function toStr({ chain, code, structureSeqPos, }) {
    return [
        structureSeqPos === undefined ? '' : `Position: ${structureSeqPos + 1}`,
        code
            ? `Letter: ${code} (${proteinAbbreviationMapping[code]?.singleLetterCode})`
            : '',
        chain ? `Chain: ${chain}` : '',
    ]
        .filter(f => !!f)
        .join(', ');
}
export function invertMap(arg) {
    return Object.fromEntries(Object.entries(arg)
        .map(([a, b]) => [b, +a])
        .filter(f => f[0] !== undefined));
}
//# sourceMappingURL=util.js.map