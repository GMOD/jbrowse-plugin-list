/**
 * The session's highlights on a structure. `session.highlights` is one list of
 * labelled genome regions that every view draws on its own terms: a band on
 * the genome, a column on the alignment, and here the residues the region
 * codes for. An unlabelled highlight draws its residues as sticks on every
 * chain that has them. A labelled one draws them as spheres on one chain, the
 * cartoon around them fades, and HighlightLabels writes the label over the
 * canvas with a leader to the spheres, so a figure or a shared session names
 * the same position in each view.
 *
 * Every Mol* cell this makes is tagged `SESSION_HIGHLIGHTS_TAG`. A change
 * rebuilds all of them, since highlights change by hand and a structure holds
 * a few.
 */
import { SITES_TAG } from './alignmentSites';
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
 * `labelSeqIds` without the residues a labelled mark draws: a seeded
 * selection's solid color would hide the mark's, and the label already
 * points there
 */
export function withoutLabelledResidues(labelSeqIds, marks) {
    const labelled = new Set(marks.flatMap(m => (m.label ? m.labelSeqIds : [])));
    return labelSeqIds.filter(id => !labelled.has(id));
}
/** The label and color of each labelled residue's anchor cell, by state ref */
const anchorsByPlugin = new WeakMap();
export function labelAnchors(plugin) {
    let anchors = anchorsByPlugin.get(plugin);
    if (!anchors) {
        anchors = new Map();
        anchorsByPlugin.set(plugin, anchors);
    }
    return anchors;
}
// how far around a labelled residue the cartoon fades, and how much
const FADE_RADIUS = 12;
const FADE_TRANSPARENCY = 0.75;
/**
 * Make each structure's highlight marks match `marks`: the old ones go, and
 * each mark gets its residues in its color. A labelled mark also gets an
 * anchor cell, the selection HighlightLabels points its label at, and fades
 * the cartoon around it.
 */
export async function syncSessionHighlightMarks({ plugin, structures, }) {
    const molstar = await loadMolstar();
    const { Color, MolScriptBuilder: MS, Script, StateSelection, StateTransforms, StructureElement, StructureProperties: SP, createStructureRepresentationParams, formatMolScript, } = molstar;
    // the first chain of an entity: a homo-oligomer such as haemoglobin's four
    // β chains carries a highlighted residue once per chain, and a label on
    // each copy would name four places, so the label goes on the first
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
    const anchors = labelAnchors(plugin);
    const update = plugin.state.data.build();
    const existing = plugin.state.data.select(StateSelection.Generators.root.subtree().withTag(SESSION_HIGHLIGHTS_TAG));
    for (const cell of existing) {
        anchors.delete(cell.transform.ref);
        update.delete(cell.transform.ref);
    }
    for (const { molstarStructure, marks } of structures) {
        const root = structureRootCell(plugin, molstar, molstarStructure);
        if (!root) {
            continue;
        }
        const labelled = [];
        for (const { entityId, labelSeqIds, label, color } of marks) {
            const chain = label ? firstChain(molstarStructure, entityId) : undefined;
            const residues = MS.core.set.has([
                MS.set(...labelSeqIds),
                MS.ammp('label_seq_id'),
            ]);
            const expression = MS.struct.generator.atomGroups(chain
                ? {
                    'chain-test': MS.core.rel.eq([MS.ammp('label_asym_id'), chain]),
                    'residue-test': residues,
                }
                : {
                    'entity-test': MS.core.rel.eq([
                        MS.ammp('label_entity_id'),
                        entityId,
                    ]),
                    'residue-test': residues,
                });
            update
                .to(root)
                .apply(StateTransforms.Model.StructureComponent, {
                type: { name: 'expression', params: expression },
                nullIfEmpty: true,
                label: label ?? 'Session highlight',
            }, { tags: [SESSION_HIGHLIGHTS_TAG] })
                .apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(plugin, molstarStructure, {
                ...(chain
                    ? { type: 'spacefill', typeParams: { sizeFactor: 1 } }
                    : {
                        type: 'ball-and-stick',
                        typeParams: { sizeFactor: 0.3, sizeAspectRatio: 0.6 },
                    }),
                color: 'uniform',
                colorParams: { value: Color.fromHexStyle(color) },
            }), { tags: [SESSION_HIGHLIGHTS_TAG] });
            if (label && chain) {
                labelled.push(expression);
                const anchor = update.toRoot().apply(StateTransforms.Model.MultiStructureSelectionFromExpression, {
                    selections: [{ key: 'a', ref: root.transform.ref, expression }],
                    isTransitive: true,
                    label,
                }, {
                    dependsOn: [root.transform.ref],
                    tags: [SESSION_HIGHLIGHTS_TAG],
                });
                anchors.set(anchor.ref, { label, color });
            }
        }
        if (labelled.length > 0) {
            const hotspots = MS.struct.combinator.merge(labelled);
            const around = Script(formatMolScript(MS.struct.modifier.exceptBy({
                0: MS.struct.modifier.includeSurroundings({
                    0: hotspots,
                    radius: FADE_RADIUS,
                    'as-whole-residues': true,
                }),
                by: hotspots,
            })), 'mol-script');
            const representations = plugin.state.data.select(StateSelection.Generators.ofTransformer(StateTransforms.Representation.StructureRepresentation3D, root.transform.ref));
            for (const representation of representations) {
                if (!representation.state.isGhost &&
                    !representation.transform.tags?.includes(SESSION_HIGHLIGHTS_TAG) &&
                    !representation.transform.tags?.includes(SITES_TAG)) {
                    update
                        .to(representation)
                        .apply(StateTransforms.Representation
                        .TransparencyStructureRepresentation3DFromScript, { layers: [{ script: around, value: FADE_TRANSPARENCY }] }, { tags: [SESSION_HIGHLIGHTS_TAG] });
                }
            }
        }
    }
    await update.commit();
}
/**
 * The camera that looks at the whole structure from the side its labelled
 * residues sit on, at the distance Mol* frames the scene from, or undefined
 * when nothing is labelled or the residues average out at the centre. A
 * residue facing away from the camera hides behind the fold, so a label
 * there points at nothing visible.
 */
export function highlightCameraSnapshot(plugin, molstar) {
    const { StateSelection, StateTransforms, StructureElement, Vec3 } = molstar;
    const anchors = plugin.state.data.select(StateSelection.Generators.root
        .subtree()
        .withTag(SESSION_HIGHLIGHTS_TAG)
        .withTransformer(StateTransforms.Model.MultiStructureSelectionFromExpression));
    const mean = Vec3();
    let n = 0;
    let sphere;
    for (const cell of anchors) {
        const loci = cell.obj?.data?.[0]?.loci;
        if (loci) {
            Vec3.add(mean, mean, StructureElement.Loci.getBoundary(loci).sphere.center);
            sphere ??= loci.structure.boundary.sphere;
            n++;
        }
    }
    if (!sphere) {
        return undefined;
    }
    const target = Vec3.clone(sphere.center);
    const { radius } = sphere;
    const outward = Vec3.sub(Vec3(), Vec3.scale(mean, mean, 1 / n), target);
    if (Vec3.magnitude(outward) < 1) {
        return undefined;
    }
    Vec3.normalize(outward, outward);
    return (camera) => {
        const focus = camera.getFocus(target, radius);
        const distance = Vec3.distance(focus.position, target);
        // the camera's up, levelled into the plane the new view faces
        const up = Vec3.clone(camera.state.up);
        Vec3.scaleAndAdd(up, up, outward, -Vec3.dot(up, outward));
        return {
            ...focus,
            position: Vec3.scaleAndAdd(Vec3(), target, outward, distance),
            ...(Vec3.magnitude(up) > 1e-6 ? { up: Vec3.normalize(up, up) } : {}),
        };
    };
}
