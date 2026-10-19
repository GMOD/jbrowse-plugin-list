import loadMolstar from './loadMolstar';
import { structureRootCell } from './structureCells';
/**
 * Shows or hides every Mol* structure of one load, each model of an NMR
 * ensemble included, by the subtree visibility the Mol* state tree's eye icon
 * sets. The cells come from the live tree, like colour and removal, so a load
 * that landed an instant ago is reached too.
 */
export async function setStructuresHidden({ plugin, structures, hidden, }) {
    const molstar = await loadMolstar();
    for (const structure of structures) {
        const cell = structureRootCell(plugin, molstar, structure);
        if (cell && cell.state.isHidden !== hidden) {
            molstar.setSubtreeVisibility(plugin.state.data, cell.transform.ref, hidden);
        }
    }
}
