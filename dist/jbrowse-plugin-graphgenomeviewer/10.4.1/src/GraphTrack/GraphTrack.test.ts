import PluginManager from '@jbrowse/core/PluginManager'
import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { BaseDisplay } from '@jbrowse/core/pluggableElementTypes'
import DisplayType from '@jbrowse/core/pluggableElementTypes/DisplayType'
import { types } from '@jbrowse/mobx-state-tree'

import GraphTrackF, { SYNTENY_DISPLAYS } from './index'
import GbzBaseSyntenyAdapterF from '../GbzBaseSyntenyAdapter/index'
import RgfaTabixAdapterF from '../RgfaTabixAdapter/index'
import WalkTabixSyntenyAdapterF from '../WalkTabixSyntenyAdapter/index'

function displayStub(name: string) {
  const configSchema = ConfigurationSchema(
    name,
    {},
    { explicitlyTyped: true, explicitIdentifier: 'displayId' },
  )
  return new DisplayType({
    name,
    configSchema,
    stateModel: types.compose(
      name,
      BaseDisplay,
      types.model({ type: types.literal(name) }),
    ),
    // core's own displays belong to other track types, and GraphTrack picks
    // them up by name
    trackType: 'FeatureTrack',
    viewType: 'LinearGenomeView',
    ReactComponent: () => null,
  })
}

function displaysFor() {
  const pluginManager = new PluginManager()
  for (const name of [
    'LinearGraphDisplay',
    'LinearBasicDisplay',
    ...SYNTENY_DISPLAYS,
  ]) {
    pluginManager.addDisplayType(() => displayStub(name))
  }
  RgfaTabixAdapterF(pluginManager)
  GbzBaseSyntenyAdapterF(pluginManager)
  WalkTabixSyntenyAdapterF(pluginManager)
  GraphTrackF(pluginManager)
  pluginManager.createPluggableElements()
  const track = pluginManager.getTrackType('GraphTrack')
  return (adapter: string) => {
    const has = new Set(
      pluginManager.getAdapterType(adapter).adapterCapabilities,
    )
    return track.displayTypes
      .filter(d => d.adapterCapabilities.every(c => has.has(c)))
      .map(d => d.name)
  }
}

test('the segments lane is offered only where getFeatures gives reference segments', () => {
  const offered = displaysFor()
  expect(offered('RgfaTabixAdapter')).toEqual([
    'LinearGraphDisplay',
    'LinearBasicDisplay',
  ])
  for (const lanes of ['WalkTabixSyntenyAdapter', 'GbzBaseSyntenyAdapter']) {
    expect(offered(lanes)).toEqual(['LinearGraphDisplay', ...SYNTENY_DISPLAYS])
  }
})
