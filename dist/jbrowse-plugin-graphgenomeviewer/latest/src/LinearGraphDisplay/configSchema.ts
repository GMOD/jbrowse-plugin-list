import { LAYOUT_ENGINE_VALUES } from '@jbrowse/bandage-core/layoutEngines'
import { LAYOUT_MODE_VALUES } from '@jbrowse/bandage-core/layoutModes'
import { DEFAULT_TRACK_FIT } from '@jbrowse/bandage-core/trackFit'
import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { heightModeConfigSchemaFields } from '@jbrowse/display-kit/heightModeConfigSchemaFields'
import { trackHeightConfigSchemaFields } from '@jbrowse/display-kit/trackHeightConfigSchemaFields'

import { graphFacetConfigSchema } from './graphFacetConfigSchema'
import { HOVER_HIGHLIGHT_VALUES } from '../GraphGenomeView/hoverHighlight'
import { lenientSlotEnum } from '../GraphGenomeView/lenientEnum'
import { DEFAULT_LINKS_DRAWN, LINKS_DRAWN_VALUES } from '../linksDrawn'

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
       * the layout the track opens in: `force`, which `layoutEngine` draws,
       * or `auto` for the anchored layout, whose x is reference bp
       */
      layoutMode: {
        type: 'stringEnum',
        model: lenientSlotEnum(LAYOUT_MODE_VALUES, 'force'),
        defaultValue: 'force',
      },
      /**
       * #slot
       * the engine that draws `force`: Bandage's `fmmm`, or `stress`, which
       * holds the reference straight and keeps a re-cut's drawing in place
       * (ADR-044)
       */
      layoutEngine: {
        type: 'stringEnum',
        model: lenientSlotEnum(LAYOUT_ENGINE_VALUES, 'fmmm'),
        defaultValue: 'fmmm',
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
       * the defaults: `paths`, `bubbles`, `walkStrip`, `walkRibbons` and
       * `smallSites` are off, `deletions`, `genes` and `referenceStrip` on
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
       * the rows walk rows draw: `{ kept: [...] }` names the samples, or
       * `sample#haplotype` haplotypes, shown; `{ kept: 'lifted' }` shows the
       * haplotypes of the lifted walks
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
        model: lenientSlotEnum(HOVER_HIGHLIGHT_VALUES, 'nodes'),
        defaultValue: 'nodes',
      },
      /**
       * #slot
       * the links a cut of a walk file draws: `walked`, those the haplotypes
       * shown walk, or `between`, also those any other haplotype in the file
       * takes between the nodes shown. Walk rows draw no links
       */
      links: {
        type: 'stringEnum',
        model: lenientSlotEnum(LINKS_DRAWN_VALUES, DEFAULT_LINKS_DRAWN),
        defaultValue: DEFAULT_LINKS_DRAWN,
      },
      ...trackHeightConfigSchemaFields({
        defaultHeight: 300,
        height: 'the height of the track the graph is drawn in',
      }),
      ...heightModeConfigSchemaFields({
        heightMode:
          "how a force drawing the view's window places meets the track's height: `fit` shrinks the whole cut to the track's height; `fixed` draws it at the window's scale, so a zoom magnifies it, lowered only as far as keeps the reference the window shows inside the track, which it holds whole, and marks where what hangs off that reference runs past the top or bottom; `grow` does the same in a track grown to hold the cut, up to `growMaxHeight`",
        growMaxHeight: 'the tallest `grow` makes the track, in px',
        defaultHeightMode: DEFAULT_TRACK_FIT,
      }),
    },
    {
      explicitlyTyped: true,
      explicitIdentifier: 'displayId',
    },
  )
}

export type LinearGraphDisplayConfigModel = ReturnType<
  typeof configSchemaFactory
>
