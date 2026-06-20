import {
  ConfigurationReference,
  getConf,
  readConfObject,
} from '@jbrowse/core/configuration'
import { BaseConnectionModelFactory } from '@jbrowse/core/pluggableElementTypes/models'
import { getSession } from '@jbrowse/core/util'
import { types } from '@jbrowse/mobx-state-tree'

// locals
import configSchema from './configSchema'
import { generateTracks } from './tracks'
import { mfetch } from './util'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { AnyConfigurationModel } from '@jbrowse/core/configuration'
import type { Instance } from '@jbrowse/mobx-state-tree'

export default function stateModelFactory(pluginManager: PluginManager) {
  return BaseConnectionModelFactory(pluginManager)
    .named('TheTrackHubRegistryConnection')
    .props({
      type: types.literal('TheTrackHubRegistryConnection'),
      configuration: ConfigurationReference(configSchema),
    })
    .volatile(() => ({
      error: undefined as unknown,
    }))
    .actions((self) => ({
      async connect(connectionConf: AnyConfigurationModel) {
        self.clear()
        const trackDbId = readConfObject(connectionConf, 'trackDbId')
        try {
          const trackDb = await mfetch(
            `https://www.trackhubregistry.org/api/search/trackdb/${trackDbId}`,
          )
          const assemblyName = trackDb.assembly.name
          const session = getSession(self)
          const assembly = session.assemblyManager.get(assemblyName)
          if (!assembly) {
            throw new Error(`unknown assembly ${assemblyName}`)
          }
          const sequenceAdapter = getConf(assembly, ['sequence', 'adapter'])
          const tracks = generateTracks(trackDb, assemblyName, sequenceAdapter)

          self.setTrackConfs(tracks)
        } catch (e) {
          console.error(e)
          this.setError(e)
        }
      },
      setError(e: unknown) {
        self.error = e
      },
    }))
}

export type TrackHubConnectionStateModel = ReturnType<typeof stateModelFactory>
export type TrackHubConnectionModel = Instance<TrackHubConnectionStateModel>
