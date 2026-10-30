import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { facetConfigSchema } from '@jbrowse/display-kit/facetConfigSchema'

/**
 * #config GraphFacet
 * The graph display's `facet`: core's Facet, a `field` and the `sort` its
 * sections lead with, and the `columns` a node layout's panels wrap at. A
 * bare string is the field.
 *
 * #example
 * ```js
 * { type: 'LinearGraphDisplay', facet: { field: 'walk', columns: 3 } }
 * ```
 */
export const graphFacetConfigSchema = ConfigurationSchema(
  'GraphFacet',
  {
    /**
     * #slot columns
     * Panels per row of a node layout's grid; unset fits them to the track.
     */
    columns: {
      type: 'maybeNumber',
      description: "panels per row of a node layout's grid; unset fits them",
    },
  },
  {
    /**
     * #baseConfiguration
     */
    baseConfiguration: facetConfigSchema,
    // bandage-core's `domain` through 11.x, its `sort` since 12
    retired: {
      domain: (sort: unknown) => ({ sort }),
    },
  },
)
