import { getContainingTrack, getSession } from '@jbrowse/core/util'
import AddIcon from '@mui/icons-material/Add'

import LaunchProteinViewDialog from './components/LaunchProteinViewDialog'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { PluggableElementType } from '@jbrowse/core/pluggableElementTypes'
import type DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'
import type { MenuItem } from '@jbrowse/core/ui'
import type { Feature } from '@jbrowse/core/util'
import type { IAnyModelType } from '@jbrowse/mobx-state-tree'

function isDisplay(elt: { name: string }): elt is DisplayType {
  return elt.name === 'LinearBasicDisplay'
}

function extendStateModel(stateModel: IAnyModelType) {
  return stateModel.views(
    (self: {
      contextMenuItems: () => MenuItem[]
      contextMenuFeature?: Feature
      contextMenuInfo?: { regionNumber: number }
      fetchFullFeature?: (
        featureId: string,
        regionNumber: number,
      ) => Promise<Feature | undefined>
    }) => {
      const superContextMenuItems = self.contextMenuItems
      return {
        contextMenuItems() {
          const feature = self.contextMenuFeature
          const track = getContainingTrack(self)
          // DO NOT DELETE: contextMenuInfo must be captured here, not inside
          // onClick. The canvas display clears contextMenuInfo when the context
          // menu closes, which happens before onClick fires. Capturing it here
          // in the view ensures the regionNumber is available in the closure.
          const contextMenuInfo = self.contextMenuInfo
          const showProteinMenuItem =
            feature &&
            ['gene', 'mRNA', 'transcript'].includes(feature.get('type'))
          return [
            ...superContextMenuItems(),
            ...(showProteinMenuItem
              ? [
                  {
                    label: 'Launch protein view',
                    icon: AddIcon,
                    onClick: () => {
                      const session = getSession(track)
                      const openDialog = (f: Feature) => {
                        session.queueDialog(handleClose => [
                          LaunchProteinViewDialog,
                          { model: track, handleClose, feature: f },
                        ])
                      }
                      if (self.fetchFullFeature && contextMenuInfo) {
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                        ;(async () => {
                          try {
                            const fullFeature = await self.fetchFullFeature!(
                              feature.id(),
                              contextMenuInfo.regionNumber,
                            )
                            if (fullFeature) {
                              openDialog(fullFeature)
                            }
                          } catch (e) {
                            console.error(e)
                            session.notify(`${e}`, 'error')
                          }
                        })()
                      } else {
                        openDialog(feature)
                      }
                    },
                  },
                ]
              : []),
          ]
        },
      }
    },
  )
}

export default function LaunchProteinViewF(pluginManager: PluginManager) {
  pluginManager.addToExtensionPoint(
    'Core-extendPluggableElement',
    (elt: PluggableElementType) => {
      if (isDisplay(elt)) {
        elt.stateModel = extendStateModel(elt.stateModel)
      }
      return elt
    },
  )
}
