import loadMolstar from './loadMolstar';
import { serialPerPlugin } from './serialPerPlugin';
import { structureRootCell } from './structureCells';
/**
 * Shows or hides every Mol* structure of one load, each model of an NMR
 * ensemble included, by the subtree visibility the Mol* state tree's eye icon
 * sets. The cells come from the live tree, like color and removal, so a load
 * that landed an instant ago is reached too. Only the root is compared, so a
 * cell hidden in Mol*'s own panel stays hidden; what the view draws under a
 * hidden root starts hidden (see drawnUnder).
 */
export function setStructuresHidden({ plugin, structures, hidden, }) {
    return serialPerPlugin(plugin, async () => {
        const molstar = await loadMolstar();
        for (const structure of structures) {
            const cell = structureRootCell(plugin, molstar, structure);
            if (cell && !!cell.state.isHidden !== hidden) {
                molstar.setSubtreeVisibility(plugin.state.data, cell.transform.ref, hidden);
            }
        }
    });
}
