import { lazy } from 'react'

import {
  getContainingTrack,
  getContainingView,
  getSession,
  isGeneLikeType,
} from '@jbrowse/core/util'
import AddIcon from '@mui/icons-material/Add'

import { isCodingFeature } from './codingFeature'
import { isLaunchingGenomeView } from './utils/genomeView'
import { getGeneDisplayName } from './utils/util'

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

function withCodingFeature(
  self: DisplayModel,
  target: MenuTarget,
  then: (feature: Feature) => Promise<void> | void,
) {
  const session = getSession(self)
  target
    .fetchFeature()
    .then(feature => {
      if (!feature) {
        session.notify('Could not load feature for protein view', 'warning')
        return undefined
      } else if (!isCodingFeature(feature)) {
        session.notify(
          `${feature.get('name') ?? feature.get('id') ?? 'This feature'} has no coding sequence, so there is no protein to show`,
          'info',
        )
        return undefined
      } else {
        return then(feature)
      }
    })
    .catch((e: unknown) => {
      console.error(e)
      session.notifyError(`${e}`, e)
    })
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
  withCodingFeature(self, target, feature => {
    openDialog(self, target, feature)
  })
}

const lookingUp = new Set<string>()

// The dialog's defaults without the dialog. Where they name no single
// structure, a gene two UniProt entries answer to or one AlphaFold has not
// folded, the dialog opens for the choice only a person can make.
function openAlphaFoldStructure(self: DisplayModel, target: MenuTarget) {
  const session = getSession(self)
  const view = getContainingView(self)
  withCodingFeature(self, target, async feature => {
    const name = getGeneDisplayName(feature)
    const genomeView = isLaunchingGenomeView(view) ? view : undefined
    const assemblyName = genomeView?.assemblyNames[0]
    if (!genomeView || !assemblyName) {
      openDialog(self, target, feature)
      return
    }
    const key = `${genomeView.id}:${feature.id()}:${target.preferredTranscriptId}`
    if (lookingUp.has(key)) {
      session.notify(
        `Still looking up the AlphaFold structure of ${name}`,
        'info',
      )
      return
    }
    lookingUp.add(key)
    try {
      session.notify(`Looking up the AlphaFold structure of ${name}`, 'info')
      const [
        { describeMissingStructure, resolveGeneLaunch, sessionGeneLaunchHost },
        { launch3DProteinView },
      ] = await Promise.all([
        import('./resolveGeneLaunch'),
        import('./utils/launchViewUtils'),
      ])
      const launch = await resolveGeneLaunch({
        host: sessionGeneLaunchHost(session, assemblyName),
        feature,
        preferredTranscriptId: target.preferredTranscriptId,
      })
      const { transcript, userProvidedTranscriptSequence, uniprotId, url } =
        launch
      if (url) {
        await launch3DProteinView({
          session,
          view: genomeView,
          feature,
          selectedTranscript: transcript,
          uniprotId,
          url,
          userProvidedTranscriptSequence,
        })
      } else {
        session.notify(
          describeMissingStructure(name, launch),
          launch.lookupError === undefined ? 'info' : 'warning',
        )
        openDialog(self, target, feature)
      }
    } finally {
      lookingUp.delete(key)
    }
  })
}

function proteinMenuItems(self: DisplayModel): MenuItem[] {
  const target = resolveTarget(self)
  return target && isGeneLikeType(target.type)
    ? [
        {
          label: 'Open AlphaFold structure',
          icon: AddIcon,
          onClick: () => {
            openAlphaFoldStructure(self, target)
          },
        },
        {
          label: 'Launch protein view',
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
    return [...hostItems, ...proteinMenuItems(self)]
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
