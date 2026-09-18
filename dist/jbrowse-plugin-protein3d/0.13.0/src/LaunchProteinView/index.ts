import { getContainingTrack, getSession } from '@jbrowse/core/util'
import AddIcon from '@mui/icons-material/Add'

import { extendPluggableStateModel } from '../extendStateModel'
import { geneLikeRoot, isCodingFeature, isGeneLikeType } from './codingFeature'
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

// Hosts publish the right-clicked feature in one of two shapes and the plugin
// has to serve both. Releases through v4.3.0 put the whole Feature on
// `contextMenuFeature`. jbrowse-components main replaced the block-based
// display with the canvas one, which knows only what the hit test carried and
// resolves the Feature over RPC. Neither property exists on the other host, so
// which one is present is the version check.
interface DisplayModel {
  contextMenuItems: () => MenuItem[]
  contextMenuFeature?: Feature
  contextMenuInfo?: {
    item: HitItem
    subfeature?: HitItem & { parentFeatureId: string }
    displayedRegionIndex: number
  }
  fetchFullFeature?: (
    featureId: string,
    displayedRegionIndex: number,
  ) => Promise<Feature | undefined>
}

// The host difference, resolved: the type to gate the menu item on, and the
// Feature to hand the dialog once it is clicked.
type MenuTarget =
  | { type: string; feature: Feature }
  | { type: string; fetchFeature: () => Promise<Feature | undefined> }

function canvasTarget(
  info: NonNullable<DisplayModel['contextMenuInfo']>,
  fetchFullFeature: NonNullable<DisplayModel['fetchFullFeature']>,
): MenuTarget | undefined {
  const { item, subfeature, displayedRegionIndex } = info
  const type = subfeature ? subfeature.type : item.type
  // The parent gene, not the clicked isoform: the dialog picks the transcript
  // itself and needs every CDS record, which only the whole feature carries.
  const parentId = subfeature ? subfeature.parentFeatureId : item.featureId
  return type === undefined
    ? undefined
    : {
        type,
        fetchFeature: () => fetchFullFeature(parentId, displayedRegionIndex),
      }
}

// The hit test only carries a type, so a canvas host learns whether the gene
// codes for anything after the fetch; a legacy host has the whole feature and
// can decline up front.
function legacyTarget(feature: Feature): MenuTarget | undefined {
  const root = geneLikeRoot(feature)
  const type = root.get('type')
  return type === undefined || !isCodingFeature(root)
    ? undefined
    : { type, feature: root }
}

function resolveTarget(self: DisplayModel): MenuTarget | undefined {
  const { contextMenuFeature, contextMenuInfo, fetchFullFeature } = self
  return contextMenuInfo && fetchFullFeature
    ? canvasTarget(contextMenuInfo, fetchFullFeature)
    : contextMenuFeature
      ? legacyTarget(contextMenuFeature)
      : undefined
}

function launchProteinView(self: DisplayModel, target: MenuTarget) {
  const track = getContainingTrack(self)
  const session = getSession(track)
  const openDialog = (feature: Feature) => {
    session.queueDialog(handleClose => [
      LaunchProteinViewDialog,
      { model: track, handleClose, feature },
    ])
  }
  if ('feature' in target) {
    openDialog(target.feature)
  } else {
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
}

function extendStateModel(stateModel: IAnyModelType) {
  return stateModel.views((self: DisplayModel) => {
    // .call(self), not a bare call: the canvas display's own contextMenuItems
    // reads `this.isGeneLike`, so invoking it detached throws on undefined and
    // the ErrorBoundary around the menu swallows it -- the user right-clicks a
    // feature and gets no menu at all, not merely no protein item.
    const superContextMenuItems = self.contextMenuItems
    return {
      contextMenuItems() {
        const target = resolveTarget(self)
        return [
          ...superContextMenuItems.call(self),
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
        extendPluggableStateModel(elt, extendStateModel)
      }
      return elt
    },
  )
}
