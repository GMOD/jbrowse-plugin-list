import loadMolstar from './loadMolstar';
/**
 * The loci for a set of residues. Taking label_seq_ids rather than the
 * plugin's 0-based positions keeps that conversion in one place (see
 * Entity.seqIds) instead of assuming `pos + 1`, which mis-paints a PDB file
 * whose residues don't start at 1.
 */
export function residueLoci(molstar, { structure, entityId, labelSeqIds }) {
    const sel = molstar.Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
        ...(entityId
            ? {
                'chain-test': Q.core.rel.eq([
                    Q.struct.atomProperty.macromolecular.label_entity_id(),
                    entityId,
                ]),
            }
            : {}),
        // one set membership test rather than a chain of ORs, which for a
        // whole-alignment selection was one comparison per residue
        'residue-test': Q.core.set.has([
            Q.core.type.set([...new Set(labelSeqIds)]),
            Q.struct.atomProperty.macromolecular.label_seq_id(),
        ]),
        'group-by': Q.struct.atomProperty.macromolecular.residueKey(),
    }), structure);
    return molstar.StructureSelection.toLociWithSourceUnits(sel);
}
/**
 * Reconcile one interactivity channel (hover-`highlight` or click-`select`) to
 * the residues every structure of a view wants lit. The channel is plugin-wide,
 * so a call covers all structures at once; clearing per structure wipes the
 * others. Nothing awaits between clearing and marking, so when two calls
 * overlap the later one's residues are what stay lit.
 *
 * The residues are marked exactly as given. Mol* would otherwise widen them
 * to its Picking Level, a setting meant for the user's own clicks, and a user
 * who set it to Chain saw one hovered codon light the whole chain.
 */
export async function setMolstarLoci({ interactivity, channel, targets, }) {
    const molstar = await loadMolstar();
    const locis = targets
        .filter(t => t.labelSeqIds.length > 0)
        .map(t => residueLoci(molstar, t));
    const { lociHighlights, lociSelects } = interactivity;
    if (channel === 'highlight') {
        lociHighlights.clearHighlights();
        for (const loci of locis) {
            lociHighlights.highlight({ loci }, false);
        }
    }
    else {
        lociSelects.deselectAll();
        for (const loci of locis) {
            lociSelects.select({ loci }, false);
        }
    }
}
