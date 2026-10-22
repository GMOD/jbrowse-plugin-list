import loadMolstar from './loadMolstar';
import { encodedColor } from './markEncoding';
import { parseSite, siteExpression } from './residueSpec';
import { serialPerPlugin } from './serialPerPlugin';
import { structureRootCell } from './structureCells';
export const RESIDUE_MARKS_TAG = 'jbrowse-residue-marks';
function markRepresentation(mark) {
    return mark === 'sticks'
        ? {
            type: 'ball-and-stick',
            typeParams: { sizeFactor: 0.35, sizeAspectRatio: 0.7 },
        }
        : // as thick as the cartoon drawOnlyChains gives the chains beside it
            mark === 'cartoon'
                ? { type: 'cartoon', typeParams: { sizeFactor: 0.45 } }
                : { type: 'spacefill', typeParams: { sizeFactor: 1 } };
}
export const DEFAULT_MARK_COLOR = '#f28e2b';
export function syncResidueMarks({ plugin, structures, marks, }) {
    return serialPerPlugin(plugin, RESIDUE_MARKS_TAG, async () => {
        const molstar = await loadMolstar();
        const { Color, MolScriptBuilder: MS, StateSelection, StateTransforms, createStructureRepresentationParams, } = molstar;
        const update = plugin.state.data.build();
        for (const cell of plugin.state.data.select(StateSelection.Generators.root.subtree().withTag(RESIDUE_MARKS_TAG))) {
            update.delete(cell.transform.ref);
        }
        for (const mark of marks) {
            const structure = structures[mark.structure ?? 0];
            const site = parseSite(mark.site);
            const root = structure
                ? structureRootCell(plugin, molstar, structure)
                : undefined;
            if (!structure || !site || !root) {
                continue;
            }
            const color = encodedColor(mark.encoding, DEFAULT_MARK_COLOR);
            update
                .to(root)
                .apply(StateTransforms.Model.StructureComponent, {
                type: { name: 'expression', params: siteExpression(MS, site) },
                nullIfEmpty: true,
                label: mark.site,
            }, { tags: [RESIDUE_MARKS_TAG] })
                .apply(StateTransforms.Representation.StructureRepresentation3D, createStructureRepresentationParams(plugin, structure, {
                ...markRepresentation(mark.mark),
                color: 'uniform',
                colorParams: { value: Color.fromHexStyle(color) },
            }), { tags: [RESIDUE_MARKS_TAG] });
        }
        await update.commit();
    });
}
