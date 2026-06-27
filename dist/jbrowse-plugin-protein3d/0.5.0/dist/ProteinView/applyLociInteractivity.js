import loadMolstar from './loadMolstar';
const seqId = (Q) => Q.struct.atomProperty.macromolecular.label_seq_id();
const specToTest = (spec) => spec.kind === 'range'
    ? Q => Q.core.logic.and([
        Q.core.rel.gre([seqId(Q), spec.start + 1]),
        Q.core.rel.lte([seqId(Q), spec.end]),
    ])
    : Q => Q.core.logic.or(spec.residues.map(pos => Q.core.rel.eq([seqId(Q), pos + 1])));
const isActive = (spec) => spec !== undefined &&
    (spec.kind === 'range' ? spec.end > spec.start : spec.residues.length > 0);
/**
 * Reconcile one interactivity channel (hover-`highlight` or click-`select`) to
 * the desired residue spec. Passing `undefined` (or an empty `list`) clears the
 * channel, so callers describe the target state declaratively rather than
 * juggling clear/apply calls.
 */
export async function setMolstarLoci({ structure, plugin, channel, spec, }) {
    const { lociHighlights, lociSelects } = plugin.managers.interactivity;
    if (channel === 'highlight') {
        lociHighlights.clearHighlights();
    }
    else {
        lociSelects.deselectAll();
    }
    if (isActive(spec)) {
        const { StructureSelection, Script } = await loadMolstar();
        const sel = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
            'residue-test': specToTest(spec)(Q),
            'group-by': Q.struct.atomProperty.macromolecular.residueKey(),
        }), structure);
        const loci = StructureSelection.toLociWithSourceUnits(sel);
        if (channel === 'highlight') {
            lociHighlights.highlight({ loci });
        }
        else {
            lociSelects.select({ loci });
        }
    }
}
