import loadMolstar from './loadMolstar';
import { getMolstarStructureSelection } from './util';
export default async function selectResidue({ structure, selectedResidue, plugin, }) {
    const { StructureSelection } = await loadMolstar();
    const sel = await getMolstarStructureSelection({ structure, selectedResidue });
    const loci = StructureSelection.toLociWithSourceUnits(sel);
    plugin.managers.interactivity.lociSelects.select({
        loci,
    });
}
//# sourceMappingURL=selectResidue.js.map