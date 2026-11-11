import { ConfigurationSchema } from '@jbrowse/core/configuration'
import { types } from '@jbrowse/mobx-state-tree'

import { WALKS_SUFFIX } from './locationName.ts'

// A file slot whose default is a url, '' for none
export const fileLocationSlot = (uri: string) => ({
  type: 'fileLocation' as const,
  defaultValue: { uri, locationType: 'UriLocation' },
})

/**
 * The index slot `openTabixSlot` reads: its own `location` and `indexType`
 */
export const tabixIndexSchema = (name: string, defaultUri = '') =>
  ConfigurationSchema(name, {
    /**
     * #slot
     */
    indexType: {
      model: types.enumeration('IndexType', ['TBI', 'CSI']),
      type: 'stringEnum',
      defaultValue: 'TBI',
    },
    /**
     * #slot
     */
    location: fileLocationSlot(defaultUri),
  })

// The index slot's snapshot for a file whose `.tbi`, or `.csi`, sits beside it
export function tbiBeside(uri: string, baseUri: unknown, csi: unknown) {
  return {
    indexType: csi ? 'CSI' : 'TBI',
    location: { uri: `${uri}.${csi ? 'csi' : 'tbi'}`, baseUri },
  }
}

// The `walksUri` shorthand: `<walksUri>.walks.gz` and its directory beside it
export function walksLocations(snap: Record<string, unknown>) {
  const { walksUri, baseUri } = snap
  if (typeof walksUri !== 'string') {
    return snap
  }
  const walks = `${walksUri}${WALKS_SUFFIX}`
  return {
    ...snap,
    walksLocation: { uri: walks, baseUri },
    walksIndex: { uri: `${walks}.idx`, baseUri },
  }
}
