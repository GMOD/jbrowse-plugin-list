import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects'

/**
 * The state cell a Mol* structure was built in, read from the live state
 * tree. `hierarchy.findStructure` answers the same question from the
 * hierarchy snapshot Mol* publishes, which it refreshes only on some state
 * events and on none while a data transaction is open anywhere in the plugin,
 * so a structure built meanwhile is missing from it and a caller skips it
 * without a word.
 */
export function structureRootCell(
  plugin: PluginContext,
  molstar: { PluginStateObject: typeof PluginStateObject },
  structure: Structure,
) {
  const parent = plugin.helpers.substructureParent.get(structure)
  return parent
    ? plugin.state.data.selectQ(q =>
        q
          .byValue(parent)
          .rootOfType(molstar.PluginStateObject.Molecule.Structure),
      )[0]
    : undefined
}
