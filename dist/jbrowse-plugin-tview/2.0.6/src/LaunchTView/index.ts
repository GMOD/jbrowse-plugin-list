import { getContainingTrack, getSession } from '@jbrowse/core/util'
import AddIcon from '@mui/icons-material/Add'

import LaunchTViewDialog from './components/LaunchTViewDialog'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { PluggableElementType } from '@jbrowse/core/pluggableElementTypes'
import type DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'
import type { MenuItem } from '@jbrowse/core/ui'
import type { IAnyModelType } from '@jbrowse/mobx-state-tree'

function isDisplay(elt: { name: string }): elt is DisplayType {
  return elt.name === 'LinearAlignmentsDisplay'
}

function extendStateModel(stateModel: IAnyModelType) {
  return stateModel.views((self: { trackMenuItems: () => MenuItem[] }) => {
    const superTrackMenuItems = self.trackMenuItems
    return {
      trackMenuItems() {
        return [
          ...superTrackMenuItems(),
          {
            label: 'Launch tview for visible region',
            icon: AddIcon,
            onClick: () => {
              const track = getContainingTrack(self)
              getSession(track).queueDialog(handleClose => [
                LaunchTViewDialog,
                {
                  model: track,
                  handleClose,
                },
              ])
            },
          },
        ]
      },
    }
  })
}

export default function LaunchTViewF(pluginManager: PluginManager) {
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
