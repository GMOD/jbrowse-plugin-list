import { LAYOUT_MODE_VALUES } from '@jbrowse/bandage-core/layoutModes'
import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { trackHeightConfigSchemaFields } from '@jbrowse/display-kit/trackHeightConfigSchemaFields'
import { types } from '@jbrowse/mobx-state-tree'

import { HOVER_HIGHLIGHT_VALUES } from '../GraphGenomeView/hoverHighlight'

import type { Instance } from '@jbrowse/mobx-state-tree'

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
       * the node color: `grey` or `uniform`, or the field nodes are colored
       * by, `depth`, `length`, `rank`, `position` or `id` (`scale:
       * 'categorical'` or `scheme: 'rainbow'`). `domainMin`/`domainMax` span
       * the position ramp. `{}` colors an anchored graph by position.
       * ```js
       * { color: { field: 'depth' } }
       * ```
       */
      color: {
        type: 'frozen',
        defaultValue: {},
      },
      /**
       * #slot
       * the node thickness: a px number draws every node that thick;
       * `{ field: 'depth', value }` thickens a node the more paths carry it,
       * around `value` px
       */
      size: {
        type: 'frozen',
        defaultValue: { field: 'depth', value: 6 },
      },
      /**
       * #slot
       * what the drawing adds over its nodes and edges, stated as changes to
       * the defaults: `paths`, `bubbles` and `walkStrip` are off, `deletions`,
       * `genes` and `referenceStrip` on
       * ```js
       * { layers: { bubbles: true, genes: false } }
       * ```
       */
      layers: {
        type: 'frozen',
        defaultValue: {},
      },
      /**
       * #slot
       * one section per value of a field: a node layout draws a panel per
       * `walk` or `sample`, and walk rows stack into a section per value of
       * a sample table column. A bare field, or `{ field, domain, columns }`
       */
      facet: {
        type: 'frozen',
        defaultValue: {},
      },
      /**
       * #slot
       * the rows walk rows draw: `{ kept: [...] }` names the samples shown
       */
      rows: {
        type: 'frozen',
        defaultValue: {},
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
    { explicitlyTyped: true, explicitIdentifier: 'displayId' },
  )
}

export type LinearGraphDisplayConfigModel = ReturnType<
  typeof configSchemaFactory
>
export type LinearGraphDisplayConfig = Instance<LinearGraphDisplayConfigModel>
