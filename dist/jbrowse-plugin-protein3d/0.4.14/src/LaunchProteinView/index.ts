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
    }) => {
      const superContextMenuItems = self.contextMenuItems
      return {
        contextMenuItems() {
          const feature = self.contextMenuFeature
          const showProteinMenuItem =
            feature !== undefined &&
            ['gene', 'mRNA', 'transcript'].includes(feature.get('type'))
          return [
            ...superContextMenuItems(),
            ...(showProteinMenuItem
              ? [
                  {
                    label: 'Launch protein view',
                    icon: AddIcon,
                    onClick: () => {
                      const track = getContainingTrack(self)
                      const session = getSession(track)
                      session.queueDialog(handleClose => [
                        LaunchProteinViewDialog,
                        { model: track, handleClose, feature },
                      ])
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
