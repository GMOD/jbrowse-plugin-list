import loadMolstar from './loadMolstar';
import { getMolstarStructureSelection } from './util';
export default async function highlightResidue({ structure, selectedResidue, plugin, }) {
    const { StructureSelection } = await loadMolstar();
    const sel = await getMolstarStructureSelection({
        structure,
        selectedResidue: selectedResidue + 1,
    });
    const loci = StructureSelection.toLociWithSourceUnits(sel);
    plugin.managers.interactivity.lociHighlights.clearHighlights();
    plugin.managers.interactivity.lociHighlights.highlight({
        loci,
    });
}
//# sourceMappingURL=highlightResidue.js.map