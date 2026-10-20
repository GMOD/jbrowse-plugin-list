/**
 * The session's highlights on a structure. `session.highlights` is one list of
 * labelled genome regions that every view draws on its own terms: a band on
 * the genome, a column on the alignment, and here the residues the region
 * codes for, drawn as sticks on every chain that has them with the
 * highlight's label written once in 3D, so a figure or a shared session names
 * the same position in each view.
 *
 * Each structure gets one component, one ball-and-stick and one label per
 * highlight, all tagged `SESSION_HIGHLIGHTS_TAG`. A change rebuilds every one
 * of them, since highlights change by hand and a structure holds a few.
 */
import loadMolstar from './loadMolstar';
import { structureRootCell } from './structureCells';
export const SESSION_HIGHLIGHTS_TAG = 'jbrowse-session-highlights';
// core's default highlight color, which the genome view's band draws in
export const DEFAULT_HIGHLIGHT_COLOR = '#FFB11D';
/**
 * Each highlight's residues on the mapped entity: genome base → transcript
 * residue (`g2p`) → structure residue → `label_seq_id`. A highlight on
 * another assembly or chromosome, or on residues the structure lacks, marks
 * nothing.
 */
export function sessionHighlightResidues({ highlights, mapping, naming, entity, transcriptToStructure, labels, }) {
    const refName = naming.canonicalRefName(mapping.refName);
    return highlights.flatMap(h => {
        if (!naming.isAssembly(h.assemblyName) ||
            naming.canonicalRefName(h.refName) !== refName) {
            return [];
        }
        const labelSeqIds = new Set();
        for (let base = h.start; base < h.end; base++) {
            const residue = mapping.g2p[base];
            const structurePos = residue === undefined ? undefined : transcriptToStructure[residue];
            const labelSeqId = structurePos === undefined ? undefined : entity.seqIds[structurePos];
            if (labelSeqId !== undefined) {
                labelSeqIds.add(labelSeqId);
            }
        }
        return labelSeqIds.size > 0
            ? [
                {
                    entityId: entity.entityId,
                    labelSeqIds: [...labelSeqIds].sort((a, b) => a - b),
                    label: labels && h.label ? h.label : undefined,
                    color: h.color ?? DEFAULT_HIGHLIGHT_COLOR,
                },
            ]
            : [];
    });
}
/**
 * Make each structure's highlight marks match `marks`: the old ones go, and
 * each mark gets its residues as sticks in its color and, when it has a
 * label, the label in 3D over them.
 */
export async function syncSessionHighlightMarks({ plugin, structures, }) {
    const molstar = await loadMolstar();
    const { Color, MolScriptBuilder: MS, StateSelection, StateTransforms, StructureElement, StructureProperties: SP, createStructureRepresentationParams, } = molstar;
    // the first chain of an entity: a homo-oligomer such as haemoglobin's four
    // β chains carries a highlighted residue once per chain, and one label per
    // copy would stack four of them, so the label goes on the first
    const firstChain = (structure, entityId) => {
        const l = StructureElement.Location.create(structure);
        for (const unit of structure.units) {
            l.unit = unit;
            l.element = unit.elements[0];
            if (SP.entity.id(l) === entityId) {
                return SP.chain.label_asym_id(l);
            }
        }
        return undefined;
    };
    const update = plugin.state.data.build();
    const existing = plugin.state.data.select(StateSelection.Generators.root.subtree().withTag(SESSION_HIGHLIGHTS_TAG));
    for (const cell of existing) {
        update.delete(cell.transform.ref);
    }
    for (const { molstarStructure, marks } of structures) {
        const root = structureRootCell(plugin, molstar, molstarStructure);
        if (!root) {
            continue;
        }
        for (const { entityId, labelSeqIds, label, color } of marks) {
            const expression = MS.struct.generator.atomGroups({
                'entity-test': MS.core.rel.eq([MS.ammp('label_entity_id'), entityId]),
                'residue-test': MS.core.set.has([
                    MS.set(...labelSeqIds),
                    MS.ammp('label_seq_id'),
                ]),
            });
            update
                .to(root)
                .apply(StateTransforms.Model.StructureComponent, {
                type: { name: 'expression', params: expression },
                nullIfEmpty: true,
                label: label ?? 'Session highlight',
            }, { tags: [SESSION_HIGHLIGHTS_TAG] })
                .apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(plugin, molstarStructure, {
                type: 'ball-and-stick',
                typeParams: { sizeFactor: 0.3, sizeAspectRatio: 0.6 },
                color: 'uniform',
                colorParams: { value: Color.fromHexStyle(color) },
            }), { tags: [SESSION_HIGHLIGHTS_TAG] });
            const chain = label ? firstChain(molstarStructure, entityId) : undefined;
            if (label && chain) {
                const labelled = MS.struct.generator.atomGroups({
                    'chain-test': MS.core.rel.eq([MS.ammp('label_asym_id'), chain]),
                    'residue-test': MS.core.set.has([
                        MS.set(...labelSeqIds),
                        MS.ammp('label_seq_id'),
                    ]),
                });
                update
                    .toRoot()
                    .apply(StateTransforms.Model.MultiStructureSelectionFromExpression, {
                    selections: [
                        { key: 'a', ref: root.transform.ref, expression: labelled },
                    ],
                    isTransitive: true,
                    label,
                }, {
                    dependsOn: [root.transform.ref],
                    tags: [SESSION_HIGHLIGHTS_TAG],
                })
                    .apply(StateTransforms.Representation.StructureSelectionsLabel3D, {
                    customText: label,
                    textSize: 4,
                    attachment: 'bottom-left',
                    scaleByRadius: false,
                    textColor: Color(0x000000),
                    borderWidth: 0,
                    background: true,
                    backgroundColor: Color(0xffffff),
                    backgroundOpacity: 0.85,
                    offsetZ: 10,
                }, { tags: [SESSION_HIGHLIGHTS_TAG] });
            }
        }
    }
    await update.commit();
}
