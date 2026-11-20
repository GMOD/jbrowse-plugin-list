import { lazy } from 'react'

import { pushLaunchViewMenuItem } from '@jbrowse/core/ui'
import {
  getContainingTrack,
  getContainingView,
  getSession,
  isGeneLikeType,
} from '@jbrowse/core/util'
import AddIcon from '@mui/icons-material/Add'

import { isCodingFeature } from './codingFeature'
import { isLaunchingGenomeView } from './utils/genomeView'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { PluggableElementType } from '@jbrowse/core/pluggableElementTypes'
import type DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'
import type { MenuItem } from '@jbrowse/core/ui'
import type { Feature } from '@jbrowse/core/util'
import type { IAnyModelType } from '@jbrowse/mobx-state-tree'

// the menu items register at boot; what they open loads on the first click
const LaunchProteinViewDialog = lazy(
  () => import('./components/LaunchProteinViewDialog'),
)

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

function openDialog(self: DisplayModel, target: MenuTarget, feature: Feature) {
  const session = getSession(self)
  const view = getContainingView(self)
  if (!isLaunchingGenomeView(view)) {
    session.notify(
      `A protein view launches from a genome view, not a ${view.type}`,
      'warning',
    )
    return
  }
  session.queueDialog(handleClose => [
    LaunchProteinViewDialog,
    {
      model: getContainingTrack(self),
      view,
      handleClose,
      feature,
      preferredTranscriptId: target.preferredTranscriptId,
    },
  ])
}

function launchProteinView(self: DisplayModel, target: MenuTarget) {
  const session = getSession(self)
  target
    .fetchFeature()
    .then(feature => {
      if (!feature) {
        session.notify('Could not load feature for protein view', 'warning')
      } else if (isCodingFeature(feature)) {
        openDialog(self, target, feature)
      } else {
        session.notify(
          `${feature.get('name') ?? feature.get('id') ?? 'This feature'} has no coding sequence, so there is no protein to show`,
          'info',
        )
      }
    })
    .catch((e: unknown) => {
      console.error(e)
      session.notifyError(`${e}`, e)
    })
}

function proteinMenuItems(self: DisplayModel): MenuItem[] {
  const target = resolveTarget(self)
  return target && isGeneLikeType(target.type)
    ? [
        {
          label: 'Protein view...',
          icon: AddIcon,
          onClick: () => {
            launchProteinView(self, target)
          },
        },
      ]
    : []
}

// `contextMenuInfo` is the host's shape and changes between releases; a throw
// while reading it would take the host's whole context menu down with it
export function withProteinMenuItems(
  self: DisplayModel,
  hostItems: MenuItem[],
) {
  try {
    const items = [...hostItems]
    for (const item of proteinMenuItems(self)) {
      pushLaunchViewMenuItem(items, item)
    }
    return items
  } catch (e) {
    console.error('Protein view menu items failed', e)
    return hostItems
  }
}

function extendStateModel(stateModel: IAnyModelType) {
  return stateModel.views((self: DisplayModel) => {
    const superContextMenuItems = self.contextMenuItems
    return {
      contextMenuItems() {
        return withProteinMenuItems(self, superContextMenuItems())
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
