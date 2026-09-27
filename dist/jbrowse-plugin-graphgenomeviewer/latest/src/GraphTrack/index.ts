import { ConfigurationSchema } from '@jbrowse/core/configuration'
import {
  TrackType,
  createBaseTrackConfig,
  createBaseTrackModel,
} from '@jbrowse/core/pluggableElementTypes'

import type PluginManager from '@jbrowse/core/PluginManager'
import type DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'

// a lanes copy asking for headerLanes, so only gbz-base offers lanes
function displaysInOrder(pluginManager: PluginManager): DisplayType[] {
  const displays = pluginManager.getElementTypesInGroup(
    'display',
  ) as DisplayType[]
  const named = (name: string) => displays.find(d => d.name === name)
  const lanes = named('MultiWaySyntenyDisplay')
  return [
    named('LinearGraphDisplay'),
    named('LinearBasicDisplay'),
    lanes &&
      Object.assign(Object.create(lanes) as DisplayType, {
        adapterCapabilities: ['headerLanes'],
      }),
  ].filter((d): d is DisplayType => d !== undefined)
}

export default function GraphTrackF(pluginManager: PluginManager) {
  pluginManager.addTrackType(() => {
    const configSchema = ConfigurationSchema(
      'GraphTrack',
      {},
      {
        baseConfiguration: createBaseTrackConfig(pluginManager),
        explicitIdentifier: 'trackId',
      },
    )
    const track = new TrackType({
      name: 'GraphTrack',
      displayName: 'Pangenome graph track',
      configSchema,
      stateModel: createBaseTrackModel(
        pluginManager,
        'GraphTrack',
        configSchema,
      ),
    })
    for (const display of displaysInOrder(pluginManager)) {
      track.addDisplayType(display)
    }
    return track
  })
}
