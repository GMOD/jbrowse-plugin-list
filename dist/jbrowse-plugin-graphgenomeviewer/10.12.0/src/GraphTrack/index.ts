import { ConfigurationSchema } from '@jbrowse/core/configuration'
import {
  TrackType,
  createBaseTrackConfig,
  createBaseTrackModel,
} from '@jbrowse/core/pluggableElementTypes'

import type PluginManager from '@jbrowse/core/PluginManager'
import type DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'

// core's synteny displays, copied to ask for headerLanes so only the gbz-base
// and walk-tabix adapters open in a synteny, dotplot or circular view.
// LinearBasicDisplay is copied to ask for referenceSegments: a lanes adapter
// answers getFeatures with every haplotype's lane features, which the segments
// lane can only offer to force-load
export const SYNTENY_DISPLAYS = [
  'MultiWaySyntenyDisplay',
  'LinearSyntenyDisplay',
  'DotplotDisplay',
  'ChordSyntenyDisplay',
]

function displaysInOrder(pluginManager: PluginManager): DisplayType[] {
  const displays = pluginManager.getElementTypesInGroup(
    'display',
  ) as DisplayType[]
  const named = (name: string) => displays.find(d => d.name === name)
  const needs = (capability: string, display: DisplayType | undefined) =>
    display &&
    Object.assign(Object.create(display) as DisplayType, {
      adapterCapabilities: [capability],
    })
  return [
    named('LinearGraphDisplay'),
    needs('referenceSegments', named('LinearBasicDisplay')),
    ...SYNTENY_DISPLAYS.map(name => needs('headerLanes', named(name))),
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
