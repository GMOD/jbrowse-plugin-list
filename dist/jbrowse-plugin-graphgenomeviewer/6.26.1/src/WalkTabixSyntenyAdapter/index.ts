import AdapterType from '@jbrowse/core/pluggableElementTypes/AdapterType'

import configSchema, { normalizeSnapshot } from './configSchema.ts'

import type PluginManager from '@jbrowse/core/PluginManager'

export default function WalkTabixSyntenyAdapterF(pluginManager: PluginManager) {
  pluginManager.addAdapterType(
    () =>
      new AdapterType({
        name: 'WalkTabixSyntenyAdapter',
        displayName: 'Walk-indexed graph adapter',
        normalizeSnapshot,
        configSchema,
        // the capabilities GbzBaseSyntenyAdapter declares, for the same
        // reasons: the header lists every haplotype as a lane, and one read
        // of an anchor window answers any pair of lanes, or several
        adapterCapabilities: [
          'getSubgraph',
          'headerLanes',
          'lanePairsOnAnchor',
          'lanePairBatches',
        ],
        adapterMetadata: {
          category: 'Synteny adapters',
        },
        getAdapterClass: () =>
          import('./WalkTabixSyntenyAdapter.ts').then(r => r.default),
      }),
  )
}
