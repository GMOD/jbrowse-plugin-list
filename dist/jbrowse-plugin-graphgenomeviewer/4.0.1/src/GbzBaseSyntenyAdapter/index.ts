import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'

import configSchema from './configSchema.ts'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function GbzBaseSyntenyAdapterF(pluginManager: PluginManager) {
  pluginManager.addAdapterType(
    () =>
      new AdapterType({
        name: 'GbzBaseSyntenyAdapter',
        displayName: 'gbz-base pangenome adapter',
        configSchema,
        // The same opened database serves the graph view's subgraph, so the
        // launch menu offers this track too (launchSubgraph/subgraphTracks).
        // headerLanes: getHeader declares every haplotype as a lane, which is
        // what makes MultiWaySyntenyDisplay read the header of an untiered
        // adapter and offer its lane picker over the whole graph.
        // lanePairsOnAnchor: a window of the anchor answers any two lanes'
        // alignment to each other, so the display fetches each adjacent pair
        // rather than composing it through the reference
        adapterCapabilities: [
          'getSubgraph',
          'headerLanes',
          'lanePairsOnAnchor',
        ],
        adapterMetadata: {
          category: 'Synteny adapters',
        },
        getAdapterClass: () =>
          import('./GbzBaseSyntenyAdapter.ts').then(r => r.default),
      }),
  )
}
