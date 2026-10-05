import {
  getContainingTrack,
  getSession,
  isGeneLikeType,
} from '@jbrowse/core/util'
import AddIcon from '@mui/icons-material/Add'

import { isCodingFeature } from './codingFeature'
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

interface HitItem {
  featureId: string
  type?: string
}

interface DisplayModel {
  contextMenuItems: () => MenuItem[]
  contextMenuInfo?: {
    item: HitItem
    subfeature?: HitItem & { parentFeatureId: string }
    displayedRegionIndex: number
  }
  fetchFullFeature: (
    featureId: string,
    displayedRegionIndex: number,
  ) => Promise<Feature | undefined>
}

interface MenuTarget {
  type: string
  preferredTranscriptId?: string
  fetchFeature: () => Promise<Feature | undefined>
}

export function resolveTarget(self: DisplayModel): MenuTarget | undefined {
  const info = self.contextMenuInfo
  if (!info) {
    return undefined
  }
  const { item, subfeature, displayedRegionIndex } = info
  const type = subfeature ? subfeature.type : item.type
  // The parent gene, not the clicked isoform: the dialog picks the transcript
  // itself and needs every CDS record, which only the whole feature carries.
  const parentId = subfeature ? subfeature.parentFeatureId : item.featureId
  return type === undefined
    ? undefined
    : {
        type,
        fetchFeature: () =>
          self.fetchFullFeature(parentId, displayedRegionIndex),
        preferredTranscriptId: subfeature?.featureId,
      }
}

function launchProteinView(self: DisplayModel, target: MenuTarget) {
  const track = getContainingTrack(self)
  const session = getSession(track)
  const { preferredTranscriptId } = target
  const openDialog = (feature: Feature) => {
    session.queueDialog(handleClose => [
      LaunchProteinViewDialog,
      { model: track, handleClose, feature, preferredTranscriptId },
    ])
  }
  target
    .fetchFeature()
    .then(feature => {
      if (!feature) {
        session.notify('Could not load feature for protein view', 'warning')
      } else if (!isCodingFeature(feature)) {
        session.notify(
          `${feature.get('name') ?? feature.get('id') ?? 'This feature'} has no coding sequence, so there is no protein to show`,
          'info',
        )
      } else {
        openDialog(feature)
      }
    })
    .catch((e: unknown) => {
      console.error(e)
      session.notifyError(`${e}`, e)
    })
}

function extendStateModel(stateModel: IAnyModelType) {
  return stateModel.views((self: DisplayModel) => {
    const superContextMenuItems = self.contextMenuItems
    return {
      contextMenuItems() {
        const target = resolveTarget(self)
        return [
          ...superContextMenuItems(),
          ...(target && isGeneLikeType(target.type)
            ? [
                {
                  label: 'Launch protein view',
                  icon: AddIcon,
                  onClick: () => {
                    launchProteinView(self, target)
                  },
                },
              ]
            : []),
        ]
      },
    }
  })
}

export default function LaunchProteinViewF(pluginManager: PluginManager) {
  pluginManager.addToExtensionPoint(
    'Core-extendPluggableElement',
    (elt: PluggableElementType) => {
      if (isDisplay(elt)) {
        elt.extendStateModel(extendStateModel)
      }
      return elt
    },
  )
}
