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
// The corner of each label its tether meets, in turn, so labels on
// neighbouring residues (KRAS G12 and G13) lean apart instead of stacking
export const LABEL_CORNERS = [
    'bottom-left',
    'top-right',
    'top-left',
    'bottom-right',
];
/**
 * How far a label moves toward the camera: the most that keeps it inside a
 * sphere of `radius`, for a residue `depth` in front of its centre. Given the
 * residue's distance from the centre in place of its depth, it holds from
 * any side
 */
export function labelOffsetZ(radius, depth) {
    return Math.max(0, radius - depth);
}
/**
 * Label text in Å, in proportion to the structure, so a label reads at about
 * one size whether the structure is one domain or a complex on DNA
 */
export function labelTextSize(radius) {
    return Math.min(8, Math.max(3, radius / 10));
}
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
    // how far a residue's atoms on `chain` sit from the structure's centre, on
    // average
    const distanceFromCentre = (structure, chain, labelSeqIds) => {
        const { center } = structure.boundary.sphere;
        const l = StructureElement.Location.create(structure);
        const p = [0, 0, 0];
        let sum = 0;
        let n = 0;
        for (const unit of structure.units) {
            l.unit = unit;
            for (const element of Array.from(unit.elements)) {
                l.element = element;
                if (SP.chain.label_asym_id(l) === chain &&
                    labelSeqIds.has(SP.residue.label_seq_id(l))) {
                    unit.conformation.position(element, p);
                    sum += Math.hypot(p[0] - center[0], p[1] - center[1], p[2] - center[2]);
                    n++;
                }
            }
        }
        return n > 0 ? sum / n : 0;
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
        const { radius } = molstarStructure.boundary.sphere;
        const textSize = labelTextSize(radius);
        for (const [i, { entityId, labelSeqIds, label, color },] of marks.entries()) {
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
                    textSize,
                    attachment: LABEL_CORNERS[i % LABEL_CORNERS.length],
                    tether: true,
                    tetherLength: 3,
                    scaleByRadius: false,
                    textColor: Color(0x000000),
                    borderWidth: 0,
                    background: true,
                    backgroundColor: Color(0xffffff),
                    backgroundOpacity: 0.85,
                    // safe from any side until fitLabelDepths knows the camera
                    offsetZ: labelOffsetZ(radius, distanceFromCentre(molstarStructure, chain, new Set(labelSeqIds))),
                }, { tags: [SESSION_HIGHLIGHTS_TAG] });
            }
        }
    }
    await update.commit();
}
/**
 * Move each session-highlight label toward the camera as far as the near
 * clipping plane allows. Mol* depth-tests text, so a label behind a helix or
 * a DNA strand would hide, and Mol* puts the near plane at the front of the
 * camera's radius, so a label pushed past it disappears. The distance depends
 * on which side the camera faces, so the view calls this when the camera
 * settles. The parameter's 10 Å bound is the UI's; the shader takes any
 * distance.
 */
export async function fitLabelDepths(plugin) {
    const camera = plugin.canvas3d?.camera;
    if (!camera) {
        return;
    }
    const { StateSelection, StateTransforms, StructureElement } = await loadMolstar();
    const labels = plugin.state.data.select(StateSelection.Generators.root
        .subtree()
        .withTag(SESSION_HIGHLIGHTS_TAG)
        .withTransformer(StateTransforms.Representation.StructureSelectionsLabel3D));
    const { position, target, radius } = camera.state;
    const toCamera = [0, 1, 2].map(k => position[k] - target[k]);
    const length = Math.hypot(...toCamera) || 1;
    const update = plugin.state.data.build();
    let changed = false;
    for (const cell of labels) {
        const parent = plugin.state.data.cells.get(plugin.state.data.tree.transforms.get(cell.transform.ref).parent);
        const selections = parent?.obj?.data;
        const loci = selections?.[0]?.loci;
        const params = cell.transform.params;
        if (!loci || !params) {
            continue;
        }
        const { center } = StructureElement.Loci.getBoundary(loci).sphere;
        const depth = [0, 1, 2].reduce((sum, k) => sum + (center[k] - target[k]) * toCamera[k], 0) / length;
        const offsetZ = labelOffsetZ(radius - params.textSize, depth);
        if (Math.abs(offsetZ - params.offsetZ) > 1) {
            update.to(cell).update({ ...params, offsetZ });
            changed = true;
        }
    }
    if (changed) {
        await update.commit();
    }
}
