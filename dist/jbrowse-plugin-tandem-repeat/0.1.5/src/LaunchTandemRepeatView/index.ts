import { getConf } from '@jbrowse/core/configuration'
import {
  getContainingTrack,
  getRpcSessionId,
  getSession,
} from '@jbrowse/core/util'

import { sampleRowsOf } from '../sampleMetadata'
import {
  hasTandemAllele,
  mayStateRepeat,
  tandemRepeatOf,
} from '../tandemRepeat'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { PluggableElementType } from '@jbrowse/core/pluggableElementTypes'
import type { MenuItem } from '@jbrowse/core/ui'
import type { Feature } from '@jbrowse/core/util'
import type { IAnyModelType, IStateTreeNode } from '@jbrowse/mobx-state-tree'

const VARIANT_DISPLAYS = new Set([
  'LinearVariantDisplay',
  'LinearMultiSampleVariantDisplay',
])

export const MENU_LABEL = 'Show repeat copies'

// The right-clicked record as each display holds it. The multi-sample display
// holds a feature with its ALT but neither INFO nor samples, and
// LinearVariantDisplay a type and an id; both fetch the whole record on click.
// The multi-sample display also holds its samples' metadata rows.
export interface DisplayModel extends IStateTreeNode {
  sources?: unknown
  contextMenuItems: () => MenuItem[]
  contextMenuInfo?: {
    feature?: Feature
    item?: { featureId: string; type?: string }
    displayedRegionIndex?: number
  }
  fetchFullFeature?: (
    featureId: string,
    displayedRegionIndex: number,
  ) => Promise<Feature | undefined>
}

export type FetchRecord = () => Promise<Feature | undefined>

// The record again, from the track's adapter over the feature's own span
async function refetch(self: DisplayModel, slim: Feature) {
  const track = getContainingTrack(self)
  const [assemblyName = ''] = getConf(track, 'assemblyNames')
  const { assemblyManager, rpcManager } = getSession(self)
  const refName = slim.get('refName')
  const canonical =
    assemblyManager.get(assemblyName)?.getCanonicalRefName(refName) ?? refName
  const features = await rpcManager.call(
    getRpcSessionId(self),
    'CoreGetFeatures',
    {
      adapterConfig: getConf(track, 'adapter'),
      regions: [
        {
          refName: canonical,
          start: slim.get('start'),
          end: slim.get('end'),
          assemblyName,
        },
      ],
    },
  )
  return (
    features.find(f => f.id() === slim.id()) ??
    features.find(
      f => f.get('start') === slim.get('start') && hasTandemAllele(f),
    )
  )
}

export function launchTarget(self: DisplayModel): FetchRecord | undefined {
  const info = self.contextMenuInfo
  const slim = info?.feature
  if (slim) {
    return hasTandemAllele(slim) ? () => refetch(self, slim) : undefined
  }
  const { fetchFullFeature } = self
  const item = info?.item
  return item && fetchFullFeature && mayStateRepeat(item.type)
    ? () => fetchFullFeature(item.featureId, info.displayedRegionIndex ?? 0)
    : undefined
}

// The variants plugin's RPC reads the adapter's samplesTsvLocation; unknown
// to this plugin's RpcRegistry, so named as a plain string
const GET_SOURCES = 'MultiSampleVariantGetSources' as string

async function samplesOf(self: DisplayModel) {
  if (Array.isArray(self.sources) && self.sources.length > 0) {
    return sampleRowsOf(self.sources)
  }
  const { rpcManager } = getSession(self)
  const answer = (await rpcManager.call(getRpcSessionId(self), GET_SOURCES, {
    adapterConfig: getConf(getContainingTrack(self), 'adapter'),
  })) as { sources?: unknown } | undefined
  return sampleRowsOf(answer?.sources)
}

export async function launch(self: DisplayModel, fetchRecord: FetchRecord) {
  const session = getSession(self)
  try {
    const feature = await fetchRecord()
    const repeat = feature && tandemRepeatOf(feature)
    if (!repeat) {
      session.notify('This record states no tandem repeat alleles', 'info')
      return
    }
    const samples = repeat.alleles.some(a => a.sample)
      ? await samplesOf(self).catch((e: unknown) => {
          session.notify(
            `The samples' metadata didn't load, so the view can't group its rows: ${e}`,
            'warning',
          )
          return undefined
        })
      : undefined
    session.addView('TandemRepeatView', {
      displayName: `${repeat.name} copies`,
      repeat,
      ...(samples ? { samples } : {}),
    })
  } catch (e) {
    session.notifyError(`${e}`, e)
  }
}

export function extendStateModel(stateModel: IAnyModelType) {
  return stateModel.views((self: DisplayModel) => {
    const superContextMenuItems = self.contextMenuItems
    return {
      contextMenuItems(): MenuItem[] {
        const fetchRecord = launchTarget(self)
        // .call(self): a host's own contextMenuItems may reach its sibling
        // views through `this`, and a throw there empties the whole menu
        return [
          ...superContextMenuItems.call(self),
          ...(fetchRecord
            ? [
                {
                  label: MENU_LABEL,
                  onClick: () => {
                    void launch(self, fetchRecord)
                  },
                },
              ]
            : []),
        ]
      },
    }
  })
}

// A host before lazy state models (v4) has no extendStateModel, and a throw
// here would take the whole session to its error page, so there the display
// is reassigned as before
interface ExtendableElement {
  name: string
  stateModel: IAnyModelType
  extendStateModel?: (extend: (m: IAnyModelType) => IAnyModelType) => void
}

export default function LaunchTandemRepeatViewF(pluginManager: PluginManager) {
  pluginManager.addToExtensionPoint(
    'Core-extendPluggableElement',
    (elt: PluggableElementType) => {
      const element = elt as unknown as ExtendableElement
      if (VARIANT_DISPLAYS.has(element.name)) {
        if (element.extendStateModel) {
          element.extendStateModel(extendStateModel)
        } else {
          element.stateModel = extendStateModel(element.stateModel)
        }
      }
      return elt
    },
  )
}
