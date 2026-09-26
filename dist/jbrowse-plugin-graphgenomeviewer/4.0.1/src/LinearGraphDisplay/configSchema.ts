import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { trackHeightConfigSchemaFields } from '@jbrowse/display-kit/trackHeightConfigSchemaFields'
import { types } from '@jbrowse/mobx-state-tree'

import { COLOR_SCHEME_VALUES } from '../GraphGenomeView/colorSchemes'
import { LAYOUT_MODE_VALUES } from '../GraphGenomeView/layoutModes'

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
       */
      colorScheme: {
        type: 'stringEnum',
        model: types.enumeration('ColorScheme', COLOR_SCHEME_VALUES),
        defaultValue: 'auto',
      },
      ...trackHeightConfigSchemaFields({
        defaultHeight: 300,
        height:
          'the most the track takes; a layout shorter than it takes only what it needs',
      }),
    },
    { explicitlyTyped: true, explicitIdentifier: 'displayId' },
  )
}

export type LinearGraphDisplayConfigModel = ReturnType<
  typeof configSchemaFactory
>
export type LinearGraphDisplayConfig = Instance<LinearGraphDisplayConfigModel>
