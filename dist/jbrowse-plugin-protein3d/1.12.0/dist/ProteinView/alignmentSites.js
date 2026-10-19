/**
 * Layer 2 of the alignment domains (see alignmentDomains): the data filtered
 * to `kind == 'site'`, drawn with the sticks mark on each site residue's side
 * chain, its color channel read through the same color object as layer 1's
 * cartoon. The selection is Mol*'s own "Sidechain with Trace" atoms (side
 * chain, CA, and proline's N), so each stick meets the cartoon at its CA.
 *
 * Each structure gets one Mol* component and one ball-and-stick
 * representation under its root cell, both tagged `SITES_TAG`, so a recolor
 * skips them and a structure's removal takes them with it. The cells come
 * from the live state tree, as color and removal read them.
 */
import loadMolstar from './loadMolstar';
import { structureRootCell } from './structureCells';
export const SITES_TAG = 'jbrowse-alignment-sites';
let revision = 0;
/**
 * Make each structure's sticks match its sites: create, update, or remove
 * them when `sites` is empty or undefined.
 */
export async function syncSiteSticks({ plugin, structures, }) {
    const molstar = await loadMolstar();
    const { MolScriptBuilder: MS, ProteinBackboneAtoms, StateSelection, StateTransforms, createStructureColorThemeParams, createStructureRepresentationParams, registerPlacedValues, } = molstar;
    revision++;
    const update = plugin.state.data.build();
    let changed = false;
    for (const { molstarStructure, sites, color } of structures) {
        const root = structureRootCell(plugin, molstar, molstarStructure);
        if (!root) {
            continue;
        }
        const existing = plugin.state.data.select(StateSelection.Generators.ofTransformer(StateTransforms.Model.StructureComponent, root.transform.ref).withTag(SITES_TAG));
        const labelSeqIds = [...(sites?.byLabelSeqId.keys() ?? [])];
        registerPlacedValues('alignment-sites', molstarStructure, sites);
        if (!sites || !color || labelSeqIds.length === 0) {
            for (const cell of existing) {
                update.delete(cell.transform.ref);
                changed = true;
            }
            continue;
        }
        const atom = (name) => MS.core.rel.eq([MS.ammp('label_atom_id'), name]);
        const component = {
            type: {
                name: 'expression',
                params: MS.struct.generator.atomGroups({
                    'entity-test': MS.core.rel.eq([
                        MS.ammp('label_entity_id'),
                        sites.entityId,
                    ]),
                    'residue-test': MS.core.set.has([
                        MS.set(...labelSeqIds),
                        MS.ammp('label_seq_id'),
                    ]),
                    'atom-test': MS.core.logic.or([
                        MS.core.logic.not([
                            MS.core.set.has([
                                MS.set(...ProteinBackboneAtoms),
                                MS.ammp('label_atom_id'),
                            ]),
                        ]),
                        atom('CA'),
                        MS.core.logic.and([
                            MS.core.rel.eq([MS.ammp('auth_comp_id'), 'PRO']),
                            atom('N'),
                        ]),
                    ]),
                }),
            },
            nullIfEmpty: true,
            label: 'Sites from the alignment',
        };
        const representation = {
            ...createStructureRepresentationParams(plugin, molstarStructure, {
                type: 'ball-and-stick',
            }),
            colorTheme: createStructureColorThemeParams(plugin, molstarStructure, 'ball-and-stick', 'alignment-domains', { revision, color, mark: 'atoms' }),
        };
        const [cell] = existing;
        if (cell) {
            update.to(cell).update(component);
            for (const repr of plugin.state.data.select(StateSelection.Generators.ofTransformer(StateTransforms.Representation.StructureRepresentation3D, cell.transform.ref))) {
                update.to(repr).update(representation);
            }
        }
        else {
            update
                .to(root)
                .apply(StateTransforms.Model.StructureComponent, component, {
                tags: [SITES_TAG],
            })
                .apply(StateTransforms.Representation.StructureRepresentation3D, representation, { tags: [SITES_TAG] });
        }
        changed = true;
    }
    if (changed) {
        await update.commit();
    }
}
