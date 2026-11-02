import { LAYOUT_MODE_VALUES } from '@jbrowse/bandage-core/layoutModes'
import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { trackHeightConfigSchemaFields } from '@jbrowse/display-kit/trackHeightConfigSchemaFields'
import { types } from '@jbrowse/mobx-state-tree'

import { graphFacetConfigSchema } from './graphFacetConfigSchema'
import { HOVER_HIGHLIGHT_VALUES } from '../GraphGenomeView/hoverHighlight'
import { retiredGraphColor } from '../GraphGenomeView/retiredNodeColor'

/**
 * #config LinearGraphDisplay
 * The graph drawn as a track of the linear genome view. A layout whose x is
 * reference bp draws under the view's coordinates and re-cuts as the view
 * moves; force, ordered and walk rows draw in their own coordinates, fitted to
 * the track.
 */
export function configSchemaFactory() {
  return ConfigurationSchema(
    'LinearGraphDisplay',
    {
      /**
       * #slot
       * the layout the track opens in
       */
      layoutMode: {
        type: 'stringEnum',
        model: types.enumeration('LayoutMode', LAYOUT_MODE_VALUES),
        defaultValue: 'auto',
      },
      /**
       * #slot
       * the channels the nodes are painted through, as core's `encoding`.
       * `color` is `{ value: 'grey' }` or `{ value: 'uniform' }`, or the
       * `field` nodes are colored by, `depth`, `length`, `rank`, `position` or
       * `id` (`scale: { type: 'ordinal' }` or `scale: { scheme: 'rainbow' }`).
       * `scale.domainMin` and `scale.domainMax` span the position ramp. `{}`
       * colors an anchored graph by position.
       * ```js
       * { encoding: { color: { field: 'depth' } } }
       * ```
       */
      encoding: {
        type: 'frozen',
        defaultValue: {},
        plot: true,
      },
      /**
       * #slot
       * the node thickness: a px number draws every node that thick;
       * `{ field: 'depth', value }` thickens a node the more paths carry it,
       * around `value` px; `{ field: 'frequency', value }` draws it as wide as
       * the share of haplotypes through it, `value` px at 100%; `links:
       * 'walks'` thickens a link the more walks take it
       */
      size: {
        type: 'frozen',
        defaultValue: { field: 'depth', value: 6 },
        plot: true,
      },
      /**
       * #slot
       * what the drawing adds over its nodes and edges, stated as changes to
       * the defaults: `paths`, `bubbles`, `walkStrip` and `walkRibbons` are
       * off, `deletions`, `genes` and `referenceStrip` on
       * ```js
       * { layers: { bubbles: true, genes: false } }
       * ```
       */
      layers: {
        type: 'frozen',
        defaultValue: {},
        plot: true,
      },
      /**
       * #slot
       * one section per value of a field: a node layout draws a panel per
       * `walk` or `sample`, and walk rows stack into a section per value of
       * a sample table column. A bare field, or `{ field, sort, columns }`
       */
      facet: graphFacetConfigSchema,
      /**
       * #slot
       * the rows walk rows draw: `{ kept: [...] }` names the samples shown
       */
      rows: {
        type: 'frozen',
        defaultValue: {},
        plot: true,
      },
      /**
       * #slot
       * what the pointer lights: `nodes` lightens a hovered node and bands its
       * span on the view; `everything` also lights edges, and the node at the
       * view's pointer bp
       */
      hover: {
        type: 'stringEnum',
        model: types.enumeration('HoverHighlight', HOVER_HIGHLIGHT_VALUES),
        defaultValue: 'nodes',
      },
      ...trackHeightConfigSchemaFields({
        defaultHeight: 300,
        height: 'the height of the track the graph is drawn in',
      }),
    },
    {
      explicitlyTyped: true,
      explicitIdentifier: 'displayId',
      retired: retiredGraphColor,
    },
  )
}

export type LinearGraphDisplayConfigModel = ReturnType<
  typeof configSchemaFactory
>
