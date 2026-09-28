import { openLocation } from '@jbrowse/core/util/io'

import {
  locationName,
  renamed,
} from '../GraphAddTrackWorkflow/buildTrackConfig.ts'

import type PluginManager from '@jbrowse/core/PluginManager'
import type { FileLocation } from '@jbrowse/core/util/types'

const GBZ_DB = /\.gbz\.db$/i

export function siblingCompanion(gbzDb: FileLocation) {
  return GBZ_DB.test(locationName(gbzDb))
    ? renamed(gbzDb, name => name.replace(GBZ_DB, '.haplotype-index.db'))
    : undefined
}

export async function findCompanion(
  gbzDb: FileLocation,
  pluginManager?: PluginManager,
) {
  const candidate = siblingCompanion(gbzDb)
  if (!candidate) {
    return undefined
  }
  try {
    await openLocation(candidate, pluginManager).stat()
    return candidate
  } catch {
    return undefined
  }
}
