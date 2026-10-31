import loadMolstar from './loadMolstar'
import { serialPerPlugin } from './serialPerPlugin'
import { structureRootCell } from './structureCells'

import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginCommands } from 'molstar/lib/mol-plugin/commands'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'

/**
 * Take one load out of Mol*, by the trajectory it came from: removing the
 * structure node alone would leave the download, trajectory and model nodes
 * behind, and an NMR ensemble's other models with them. The ghost nodes above
 * the trajectory go too, the download or pasted text and its parse, or the
 * file stays in the state tree. The cell is found in the live tree, so a
 * structure a superposition has transformed, or one that finished loading an
 * instant ago, is still found.
 */
export function removeMolstarStructure({
  plugin,
  molstarStructure,
}: {
  plugin: PluginContext
  molstarStructure: Structure | undefined
}) {
  return serialPerPlugin(plugin, async () => {
    if (!molstarStructure) {
      return
    }
    const molstar = await loadMolstar()
    const { PluginStateObject } = molstar
    const cell = structureRootCell(plugin, molstar, molstarStructure)
    const trajectory =
      cell &&
      plugin.state.data.selectQ(q =>
        q.byValue(cell).ancestorOfType(PluginStateObject.Molecule.Trajectory),
      )[0]
    const target = trajectory ?? cell
    if (target) {
      await removeWithGhosts(plugin, molstar, target.transform.ref)
    }
  })
}

/** Remove a cell and the ghost nodes above it, the download or pasted text
 * and its parse. Unserialized, for a task already in the plugin's lane. */
export async function removeWithGhosts(
  plugin: PluginContext,
  molstar: { PluginCommands: typeof PluginCommands },
  ref: string,
) {
  await molstar.PluginCommands.State.RemoveObject(plugin, {
    state: plugin.state.data,
    ref,
    removeParentGhosts: true,
  })
}
