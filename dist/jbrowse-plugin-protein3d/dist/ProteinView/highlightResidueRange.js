import loadMolstar from './loadMolstar';
async function getMolstarRangeSelection({ structure, startResidue, endResidue, }) {
    const { Script } = await loadMolstar();
    return Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
        'residue-test': Q.core.logic.and([
            Q.core.rel.gre([
                Q.struct.atomProperty.macromolecular.label_seq_id(),
                startResidue,
            ]),
            Q.core.rel.lte([
                Q.struct.atomProperty.macromolecular.label_seq_id(),
                endResidue,
            ]),
        ]),
        'group-by': Q.struct.atomProperty.macromolecular.residueKey(),
    }), structure);
}
export default async function highlightResidueRange({ structure, startResidue, endResidue, plugin, }) {
    const { StructureSelection } = await loadMolstar();
    const sel = await getMolstarRangeSelection({
        structure,
        startResidue,
        endResidue,
    });
    const loci = StructureSelection.toLociWithSourceUnits(sel);
    plugin.managers.interactivity.lociHighlights.clearHighlights();
    plugin.managers.interactivity.lociHighlights.highlight({ loci });
}
export async function selectResidueRange({ structure, startResidue, endResidue, plugin, }) {
    const { StructureSelection } = await loadMolstar();
    const sel = await getMolstarRangeSelection({
        structure,
        startResidue,
        endResidue,
    });
    const loci = StructureSelection.toLociWithSourceUnits(sel);
    plugin.managers.interactivity.lociSelects.deselectAll();
    plugin.managers.interactivity.lociSelects.select({ loci });
}
export function hexToMolstarColor(hex) {
    return parseInt(hex.replace('#', ''), 16);
}
export async function overpaintResidueRange({ startResidue, endResidue, plugin, color, }) {
    const { StructureSelection, setStructureOverpaint, Color } = await loadMolstar();
    const structureRef = plugin.managers.structure.hierarchy.current.structures[0];
    if (structureRef) {
        await setStructureOverpaint(plugin, structureRef.components, Color(parseInt(color.replace('#', ''), 16)), async (structure) => {
            const sel = await getMolstarRangeSelection({
                structure,
                startResidue,
                endResidue,
            });
            return StructureSelection.toLociWithSourceUnits(sel);
        });
    }
}
export async function clearOverpaint(plugin) {
    const { clearStructureOverpaint } = await loadMolstar();
    const structureRef = plugin.managers.structure.hierarchy.current.structures[0];
    if (structureRef) {
        await clearStructureOverpaint(plugin, structureRef.components);
    }
}
//# sourceMappingURL=highlightResidueRange.js.map