import type { Structure } from 'molstar/lib/mol-model/structure'
import type { PluginContext } from 'molstar/lib/mol-plugin/context'
import type { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects'
import type { StateTransforms } from 'molstar/lib/mol-plugin-state/transforms'
import type { StateObjectCell, StateSelection } from 'molstar/lib/mol-state'

export const SITES_TAG = 'jbrowse-alignment-sites'
export const SESSION_HIGHLIGHTS_TAG = 'jbrowse-session-highlights'
export const RESIDUE_MARKS_TAG = 'jbrowse-residue-marks'

// drawn in their own colors over the structure, so the view's color and the
// fade around a labelled highlight leave them alone
const MARK_TAGS = [SITES_TAG, SESSION_HIGHLIGHTS_TAG, RESIDUE_MARKS_TAG]

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

/**
 * The representations that draw the structure itself under `root`: the
 * preset's cartoon and ligands and the surface, without the marks the view
 * draws over them.
 */
export function structureRepresentations(
  plugin: PluginContext,
  molstar: {
    StateSelection: typeof StateSelection
    StateTransforms: typeof StateTransforms
  },
  root: StateObjectCell,
) {
  return plugin.state.data
    .select(
      molstar.StateSelection.Generators.ofTransformer(
        molstar.StateTransforms.Representation.StructureRepresentation3D,
        root.transform.ref,
      ),
    )
    .filter(
      cell =>
        !cell.state.isGhost &&
        !MARK_TAGS.some(tag => cell.transform.tags?.includes(tag)),
    )
}

/**
 * The options for a cell drawn under a structure's root: tagged, and hidden
 * while the structure is. Mol* keeps visibility per cell and starts a new one
 * visible, so a highlight drawn after the structure was hidden would show.
 */
export function drawnUnder(root: StateObjectCell, tag: string) {
  return { tags: [tag], state: { isHidden: !!root.state.isHidden } }
}
