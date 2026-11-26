import { addViewMenuItems } from '@jbrowse/core/pluggableElementTypes'
import {
  getContainingTrack,
  getContainingView,
  getSession,
} from '@jbrowse/core/util'
import AddIcon from '@mui/icons-material/Add'

import {
  alignmentsTrackIds,
  isGenomeView,
  launchTView,
  regionLaunch,
} from './launch'

import type { RegionLaunch } from './launch'
import type PluginManager from '@jbrowse/core/PluginManager'
import type { PluggableElementType } from '@jbrowse/core/pluggableElementTypes'
import type DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'
import type { MenuItem } from '@jbrowse/core/ui'
import type { AbstractSessionModel } from '@jbrowse/core/util'
import type { IAnyModelType } from '@jbrowse/mobx-state-tree'

const VISIBLE_REGION_LABEL = 'Launch tview for visible region'
const SELECTION_LABEL = 'Tview of all alignments tracks'

function isDisplay(elt: { name: string }): elt is DisplayType {
  return elt.name === 'LinearAlignmentsDisplay'
}

function launchItem({
  label,
  launch,
  session,
  tracks,
  connectedViewId,
}: {
  label: string
  launch: RegionLaunch
  session: AbstractSessionModel
  tracks: string[]
  connectedViewId: string
}): MenuItem {
  return {
    label,
    icon: AddIcon,
    disabled: launch.reason !== undefined,
    subLabel: launch.reason,
    onClick: () => {
      if (launch.reason === undefined) {
        launchTView(session, { ...launch, tracks, connectedViewId })
      }
    },
  }
}

function extendStateModel(stateModel: IAnyModelType) {
  return stateModel.views((self: { trackMenuItems: () => MenuItem[] }) => {
    const superTrackMenuItems = self.trackMenuItems
    return {
      trackMenuItems() {
        const session = getSession(self)
        const view = getContainingView(self)
        const track = getContainingTrack(self)
        return [
          ...superTrackMenuItems(),
          launchItem({
            label: VISIBLE_REGION_LABEL,
            launch: isGenomeView(view)
              ? regionLaunch(session, view.visibleWholeBaseRegions)
              : { reason: 'Not in a linear genome view' },
            session,
            tracks: [track.configuration.trackId],
            connectedViewId: view.id,
          }),
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

  addViewMenuItems(pluginManager, 'LinearGenomeView', {
    menu: 'rubberBandLaunchMenuItems',
    items: self => {
      const tracks = alignmentsTrackIds(self.tracks)
      return tracks.length
        ? launchItem({
            label: SELECTION_LABEL,
            launch: regionLaunch(
              getSession(self),
              self.getSelectedRegions(self.leftOffset, self.rightOffset),
            ),
            session: getSession(self),
            tracks,
            connectedViewId: self.id,
          })
        : undefined
    },
  })
}
