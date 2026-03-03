import {
  AnyConfigurationSchemaType,
  ConfigurationReference,
} from '@jbrowse/core/configuration/configurationSchema'
import PluginManager from '@jbrowse/core/PluginManager'
import { getSession } from '@jbrowse/core/util'
import { getParentRenderProps } from '@jbrowse/core/util/tracks'
import FilterListIcon from '@material-ui/icons/FilterList'
import { types } from 'mobx-state-tree'

export function stateModelFactory(
  configSchema: AnyConfigurationSchemaType,
  pluginManager: PluginManager,
) {
  const LGVPlugin = pluginManager.getPlugin(
    'LinearGenomeViewPlugin',
  ) as import('@jbrowse/plugin-linear-genome-view').default
  // @ts-ignore
  const { BaseLinearDisplay } = LGVPlugin.exports

  return types
    .compose(
      'LinearICGCDisplay',
      BaseLinearDisplay,
      types.model({
        type: types.literal('LinearICGCDisplay'),
        configuration: ConfigurationReference(configSchema),
      }),
    )

    .actions(self => {
      return {
        openFilterConfig() {
          const session = getSession(self)
          // @ts-ignore
          const editor = session.addWidget('ICGCFilterWidget', 'icgcFilter', {
            target: self.parentTrack.configuration,
          })
          // @ts-ignore
          session.showWidget(editor)
        },

        selectFeature(feature: any) {
          if (feature) {
            const session = getSession(self)
            // @ts-ignore
            const featureWidget = session.addWidget(
              'ICGCFeatureWidget',
              'icgcFeature',
              { featureData: feature.toJSON() },
            )
            // @ts-ignore
            session.showWidget(featureWidget)
            session.setSelection(feature)
          }
        },
      }
    })

    .views(self => {
      const {
        renderProps: superRenderProps,
        trackMenuItems: superTrackMenuItems,
      } = self

      return {
        renderProps() {
          return {
            ...superRenderProps(),
            ...getParentRenderProps(self),
            displayModel: self,
            config: self.configuration.renderer,
          }
        },

        get rendererTypeName() {
          return self.configuration.renderer.type
        },

        trackMenuItems() {
          return [
            ...superTrackMenuItems(),
            {
              label: 'Filter',
              onClick: self.openFilterConfig,
              icon: FilterListIcon,
            },
          ]
        },
      }
    })
}
