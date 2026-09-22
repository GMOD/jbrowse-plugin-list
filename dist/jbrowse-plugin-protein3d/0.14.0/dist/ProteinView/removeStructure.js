import loadMolstar from './loadMolstar';
import { structureRootCell } from './structureCells';
/**
 * Take one load out of Mol*, by the trajectory it came from: removing the
 * structure node alone would leave the download, trajectory and model nodes
 * behind, and an NMR ensemble's other models with them. The ghost nodes above
 * the trajectory go too, the download or pasted text and its parse, or the
 * file stays in the state tree. The cell is found in the live tree, so a
 * structure a superposition has transformed, or one that finished loading an
 * instant ago, is still found.
 */
export async function removeMolstarStructure({ plugin, molstarStructure, }) {
    if (!molstarStructure) {
        return;
    }
    const molstar = await loadMolstar();
    const { PluginCommands, PluginStateObject } = molstar;
    const cell = structureRootCell(plugin, molstar, molstarStructure);
    const trajectory = cell &&
        plugin.state.data.selectQ(q => q.byValue(cell).ancestorOfType(PluginStateObject.Molecule.Trajectory))[0];
    const target = trajectory ?? cell;
    if (target) {
        await PluginCommands.State.RemoveObject(plugin, {
            state: plugin.state.data,
            ref: target.transform.ref,
            removeParentGhosts: true,
        });
    }
}
