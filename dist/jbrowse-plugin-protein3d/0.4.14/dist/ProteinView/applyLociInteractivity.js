import loadMolstar from './loadMolstar';
import { getMolstarStructureSelection } from './util';
function clearLoci(plugin) {
    plugin.managers.interactivity.lociHighlights.clearHighlights();
    plugin.managers.interactivity.lociSelects.deselectAll();
}
function applyLoci(plugin, loci, mode) {
    if (mode === 'highlight') {
        plugin.managers.interactivity.lociHighlights.clearHighlights();
        plugin.managers.interactivity.lociHighlights.highlight({ loci });
    }
    else {
        plugin.managers.interactivity.lociSelects.deselectAll();
        plugin.managers.interactivity.lociSelects.select({ loci });
    }
}
export async function applyLociInteractivityMultiple({ structure, residues, plugin, mode, }) {
    if (mode === 'clear' || residues.length === 0) {
        clearLoci(plugin);
        return;
    }
    const { StructureSelection, Script } = await loadMolstar();
    const sel = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
        'residue-test': Q.core.logic.or(residues.map(residue => Q.core.rel.eq([
            Q.struct.atomProperty.macromolecular.label_seq_id(),
            residue,
        ]))),
        'group-by': Q.struct.atomProperty.macromolecular.residueKey(),
    }), structure);
    const loci = StructureSelection.toLociWithSourceUnits(sel);
    applyLoci(plugin, loci, mode);
}
export async function applyLociInteractivity({ structure, startResidue, endResidue, plugin, mode, }) {
    if (mode === 'clear') {
        clearLoci(plugin);
        return;
    }
    const { StructureSelection, Script } = await loadMolstar();
    const sel = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
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
    const loci = StructureSelection.toLociWithSourceUnits(sel);
    applyLoci(plugin, loci, mode);
}
export async function applyLociInteractivitySingle({ structure, selectedResidue, plugin, mode, }) {
    if (mode === 'clear') {
        clearLoci(plugin);
        return;
    }
    const { StructureSelection } = await loadMolstar();
    const sel = await getMolstarStructureSelection({
        structure,
        selectedResidue: selectedResidue + 1,
    });
    const loci = StructureSelection.toLociWithSourceUnits(sel);
    applyLoci(plugin, loci, mode);
}
